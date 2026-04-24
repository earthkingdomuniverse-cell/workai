#!/usr/bin/env -S node --loader ts-node/esm
// AI Swarm: bootstraps a swarm of AI users (providers/clients) to simulate value exchange
// Nâng cấp: Tích hợp NVIDIA API và bơm dữ liệu trực tiếp vào Backend đang chạy qua HTTP.

import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

// Load biến môi trường từ file .env
dotenv.config();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const API_URL = 'http://localhost:3000/api/v1';

if (!NVIDIA_API_KEY) {
  console.error('❌ Lỗi: Không tìm thấy NVIDIA_API_KEY trong file .env');
  process.exit(1);
}

// Khởi tạo OpenAI Client kết nối tới NVIDIA Endpoint
const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Các model khả dụng (có thể đổi nếu NVIDIA update)
const MODELS = [
  'meta/llama3-70b-instruct',
  'mistralai/mixtral-8x22b-instruct-v0.1',
  'meta/llama3-8b-instruct'
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getAuthToken(email: string): Promise<string> {
  const password = 'Password123!';
  
  try {
    // Thử đăng ký
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'member' })
    });
    
    let data = await signupRes.json();
    
    // Nếu đã tồn tại (email đã đăng ký), tiến hành đăng nhập
    if (!signupRes.ok && data.error?.message?.includes('already exists')) {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      data = await loginRes.json();
    } else if (!signupRes.ok) {
      throw new Error(`Auth failed: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data.data.token;
  } catch (err: any) {
    throw new Error(`Get Auth Token failed for ${email}: ${err.message}`);
  }
}

async function generateOffer(model: string, providerId: string): Promise<{ title: string, description: string, price: number, category: string }> {
  const prompt = `You are a freelance service provider with ID ${providerId}. 
Create a short, creative, and professional gig offer for a freelance marketplace.
Provide the response strictly in JSON format with the following keys:
"title" (string, max 60 chars), 
"description" (string, 1-2 sentences), 
"price" (number, between 50 and 5000), 
"category" (string, e.g., 'Software Development', 'Design', 'Data Science').
Output ONLY the JSON object, without any markdown formatting or extra text.`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    let content = response.choices[0].message.content || '{}';
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(content);
  } catch (err: any) {
    console.error(`[${model}] ⚠️ Lỗi khi sinh dữ liệu:`, err.message || err);
    return {
      title: 'AI Generated Fallback Offer',
      description: 'An issue occurred during AI generation.',
      price: randInt(100, 1000),
      category: 'Other'
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const toVal = (name: string, defaultVal: number) => {
    const p = args.find((a) => a.startsWith(name + '='));
    if (!p) return defaultVal;
    const v = parseInt(p.split('=')[1], 10);
    return Number.isFinite(v) ? v : defaultVal;
  };

  const providersCount = toVal('--providers', 2);
  const clientsCount = toVal('--clients', 2);
  const cycles = toVal('--cycles', 1);

  console.log(`🤖 AI Swarm (NVIDIA API) đang khởi động... Providers: ${providersCount}, Clients: ${clientsCount}, Cycles: ${cycles}`);

  let successCount = 0;

  for (let c = 0; c < cycles; c++) {
    console.log(`\n--- Swarm cycle ${c + 1}/${cycles} ---`);
    for (let i = 1; i <= providersCount; i++) {
      const email = `swarm_provider_${i}@example.com`;
      const model = choice(MODELS);
      console.log(`Provider [${email}] đang tạo offer bằng model [${model}]...`);
      
      try {
        const token = await getAuthToken(email);
        const offerData = await generateOffer(model, email);
        const pricingType = Math.random() < 0.5 ? 'fixed' : 'hourly';
        
        const payload = {
          title: offerData.title,
          description: offerData.description,
          category: offerData.category,
          price: offerData.price,
          currency: 'USD',
          pricingType,
        };

        const res = await fetch(`${API_URL}/offers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || 'Failed to post offer');
        }

        const resData = await res.json();
        const o = resData.data;
        
        console.log(`✅ Thành công: [${o.id}] ${o.title} ($${o.price}) - Thể loại: ${o.category}`);
        successCount++;
      } catch (e: any) {
        console.error('❌ Lỗi khi xử lý provider:', e.message);
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('\n🎉 AI Swarm hoàn tất!');
  console.log(`Tổng số Offers được ĐẨY VÀO BACKEND thành công: ${successCount}`);
}

main().catch((e) => {
  console.error('AI Swarm fatal error:', e);
  process.exit(1);
});
