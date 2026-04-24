/**
 * Assessment API Handlers (MSW)
 * Task 2.3: Mock Data Generator
 * 
 * Mock handlers for assessment endpoints
 */

import { http, HttpResponse } from 'msw';
import {
  generateMockAssessment,
  generateMockAssessments,
  generateMockQuestion,
  generateMockApiResponse,
  generateMockApiError,
  generateMockPagination,
} from '../generate-mock-data';

const API_BASE = 'http://localhost:3000/api/v1';

// Store mock assessments in memory
const mockAssessments = generateMockAssessments(50);

export const assessmentHandlers = [
  // Get all assessments
  http.get(`${API_BASE}/assessments`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    let filtered = [...mockAssessments];

    if (search) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    const paginated = generateMockPagination(filtered, page, limit);

    return HttpResponse.json(
      generateMockApiResponse(paginated.data, paginated.pagination),
      { status: 200 }
    );
  }),

  // Get single assessment
  http.get(`${API_BASE}/assessments/:id`, ({ params }) => {
    const { id } = params;
    const assessment = mockAssessments.find(a => a.id === id);

    if (!assessment) {
      return HttpResponse.json(
        generateMockApiError('Assessment not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const questions = Array.from({ length: assessment.totalQuestions }, () =>
      generateMockQuestion()
    );

    return HttpResponse.json(
      generateMockApiResponse({
        ...assessment,
        questions,
      }),
      { status: 200 }
    );
  }),

  // Create assessment
  http.post(`${API_BASE}/assessments`, async ({ request }) => {
    const body = await request.json();

    const newAssessment = generateMockAssessment({
      ...body,
      id: `assessment_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    mockAssessments.push(newAssessment);

    return HttpResponse.json(
      generateMockApiResponse(newAssessment),
      { status: 201 }
    );
  }),

  // Update assessment
  http.put(`${API_BASE}/assessments/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();

    const index = mockAssessments.findIndex(a => a.id === id);

    if (index === -1) {
      return HttpResponse.json(
        generateMockApiError('Assessment not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    mockAssessments[index] = {
      ...mockAssessments[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      generateMockApiResponse(mockAssessments[index]),
      { status: 200 }
    );
  }),

  // Delete assessment
  http.delete(`${API_BASE}/assessments/:id`, ({ params }) => {
    const { id } = params;
    const index = mockAssessments.findIndex(a => a.id === id);

    if (index === -1) {
      return HttpResponse.json(
        generateMockApiError('Assessment not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    mockAssessments.splice(index, 1);

    return HttpResponse.json(
      generateMockApiResponse({ message: 'Assessment deleted' }),
      { status: 200 }
    );
  }),

  // Publish assessment
  http.post(`${API_BASE}/assessments/:id/publish`, ({ params }) => {
    const { id } = params;
    const assessment = mockAssessments.find(a => a.id === id);

    if (!assessment) {
      return HttpResponse.json(
        generateMockApiError('Assessment not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    assessment.status = 'published';

    return HttpResponse.json(
      generateMockApiResponse(assessment),
      { status: 200 }
    );
  }),

  // Duplicate assessment
  http.post(`${API_BASE}/assessments/:id/duplicate`, ({ params }) => {
    const { id } = params;
    const assessment = mockAssessments.find(a => a.id === id);

    if (!assessment) {
      return HttpResponse.json(
        generateMockApiError('Assessment not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const duplicated = {
      ...assessment,
      id: `assessment_${Date.now()}`,
      title: `${assessment.title} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };

    mockAssessments.push(duplicated);

    return HttpResponse.json(
      generateMockApiResponse(duplicated),
      { status: 201 }
    );
  }),
];

export default assessmentHandlers;
