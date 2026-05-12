const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const RESERVED_QUERY_PARAMS = new Set([
  'fields',
  'keyword',
  'limit',
  'page',
  'q',
  'search',
  'sort'
]);

const OPERATOR_MAP = {
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  ne: '$ne',
  in: '$in'
};

const parsePositiveInteger = (value, fallback, { max } = {}) => {
  const parsed = Number.parseInt(value, 10);
  const result = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return max ? Math.min(result, max) : result;
};

const castFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(castFilterValue);
  }

  if (typeof value !== 'string') {
    return value;
  }

  if (value.includes(',')) {
    return value.split(',').map((item) => castFilterValue(item.trim()));
  }

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);

  return value;
};

const addFilterCondition = (filters, key, value) => {
  const operatorMatch = key.match(/^(.+)\[(gt|gte|lt|lte|ne|in)\]$/);

  if (operatorMatch) {
    const [, field, operator] = operatorMatch;
    filters[field] = {
      ...(filters[field] || {}),
      [OPERATOR_MAP[operator]]: castFilterValue(value)
    };
    return;
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    filters[key] = Object.entries(value).reduce((condition, [operator, operatorValue]) => {
      condition[OPERATOR_MAP[operator] || operator] = castFilterValue(operatorValue);
      return condition;
    }, {});
    return;
  }

  filters[key] = castFilterValue(value);
};

class ApiFeatures {
  constructor(query, queryString = {}) {
    this.query = query;
    this.queryString = queryString || {};
    this.pagination = {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT
    };
  }

  filter() {
    const filters = {};

    for (const [key, value] of Object.entries(this.queryString)) {
      if (RESERVED_QUERY_PARAMS.has(key) || value === undefined || value === '') {
        continue;
      }

      addFilterCondition(filters, key, value);
    }

    this.query = this.query.find(filters);
    return this;
  }

  search(fields = []) {
    const term = this.queryString.search || this.queryString.q || this.queryString.keyword;

    if (!term || fields.length === 0) {
      return this;
    }

    this.query = this.query.find({
      $or: fields.map((field) => ({
        [field]: { $regex: term, $options: 'i' }
      }))
    });

    return this;
  }

  sort(defaultSort = '-createdAt') {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : defaultSort;

    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields(defaultFields = '') {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(',').join(' '));
      return this;
    }

    if (defaultFields) {
      this.query = this.query.select(defaultFields);
    }

    return this;
  }

  paginate({ defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT } = {}) {
    const page = parsePositiveInteger(this.queryString.page, DEFAULT_PAGE);
    const limit = parsePositiveInteger(this.queryString.limit, defaultLimit, { max: maxLimit });
    const skip = (page - 1) * limit;

    this.pagination = { page, limit, skip };
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  async count() {
    try {
      if (!this.query || !this.query.model) return 0;
      return await this.query.model.countDocuments(this.query.getFilter());
    } catch (error) {
      console.error('Error in ApiFeatures count:', error);
      return 0;
    }
  }

  getPagination(total, count = 0) {
    const { page, limit } = this.pagination;
    const totalPages = Math.ceil(total / limit) || 0;

    return {
      page,
      limit,
      count,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
}

export default ApiFeatures;
