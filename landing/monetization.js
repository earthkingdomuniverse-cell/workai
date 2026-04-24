// Simple client-side monetization helper for MVP
async function subscribe(userId, planId) {
  try {
    const resp = await fetch('/api/v1/billing/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planId }),
    })
    const data = await resp.json();
    if (resp.ok) {
      alert('Subscribed: ' + (data.subscription?.planId || planId));
      return data;
    } else {
      alert('Subscription failed: ' + (data?.error ?? 'unknown'));
      return data;
    }
  } catch (e) {
    console.error(e);
    alert('Subscription error');
  }
}

window.subscribe = subscribe;
