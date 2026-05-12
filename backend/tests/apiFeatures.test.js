import { jest } from '@jest/globals';
import ApiFeatures from '../src/utils/ApiFeatures.js';

const createQuery = () => {
  const query = {
    filter: {},
    sortValue: '',
    selectValue: '',
    skipValue: 0,
    limitValue: 0,
    model: {
      countDocuments: jest.fn()
    },
    find(filters) {
      this.filter = { ...this.filter, ...filters };
      return this;
    },
    sort(value) {
      this.sortValue = value;
      return this;
    },
    select(value) {
      this.selectValue = value;
      return this;
    },
    skip(value) {
      this.skipValue = value;
      return this;
    },
    limit(value) {
      this.limitValue = value;
      return this;
    },
    getFilter() {
      return this.filter;
    }
  };

  return query;
};

describe('ApiFeatures', () => {
  test('applies filtering, searching, sorting, field limiting, and pagination', () => {
    const query = createQuery();
    const features = new ApiFeatures(query, {
      category: 'sedan',
      'dailyRate[gte]': '100',
      search: 'toyota',
      sort: '-dailyRate,createdAt',
      fields: 'make,model,dailyRate',
      page: '2',
      limit: '5'
    })
      .filter()
      .search(['make', 'model'])
      .sort()
      .limitFields()
      .paginate();

    expect(features.query.getFilter()).toEqual({
      category: 'sedan',
      dailyRate: { $gte: 100 },
      $or: [
        { make: { $regex: 'toyota', $options: 'i' } },
        { model: { $regex: 'toyota', $options: 'i' } }
      ]
    });
    expect(query.sortValue).toBe('-dailyRate createdAt');
    expect(query.selectValue).toBe('make model dailyRate');
    expect(query.skipValue).toBe(5);
    expect(query.limitValue).toBe(5);
  });

  test('builds standardized pagination metadata', () => {
    const query = createQuery();
    const features = new ApiFeatures(query, { page: '3', limit: '10' }).paginate();

    expect(features.getPagination(42, 10)).toEqual({
      page: 3,
      limit: 10,
      count: 10,
      total: 42,
      totalPages: 5,
      hasNext: true,
      hasPrev: true
    });
  });
});
