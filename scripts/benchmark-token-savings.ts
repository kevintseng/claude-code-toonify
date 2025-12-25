#!/usr/bin/env tsx
/**
 * Benchmark script to measure actual token savings across different data types
 */

import { TokenOptimizer } from '../src/optimizer/token-optimizer.js';
import { encode as toonEncode } from '@toon-format/toon';

interface BenchmarkResult {
  name: string;
  category: string;
  originalTokens: number;
  optimizedTokens: number;
  savings: number;
  savingsPercent: number;
}

const optimizer = new TokenOptimizer();

// Test data samples
const testData = {
  // Small JSON (< 100 tokens)
  smallJson: {
    name: 'Small JSON - Simple Object',
    category: 'JSON-Small',
    data: {
      user: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      }
    }
  },

  // Medium JSON (100-500 tokens)
  mediumJson: {
    name: 'Medium JSON - Product List',
    category: 'JSON-Medium',
    data: {
      products: [
        { id: 101, name: 'Laptop Pro', price: 1299, stock: 45, category: 'Electronics' },
        { id: 102, name: 'Wireless Mouse', price: 29, stock: 150, category: 'Accessories' },
        { id: 103, name: 'USB-C Cable', price: 15, stock: 200, category: 'Accessories' },
        { id: 104, name: 'Monitor 27"', price: 399, stock: 30, category: 'Electronics' },
        { id: 105, name: 'Keyboard RGB', price: 89, stock: 75, category: 'Accessories' }
      ],
      metadata: {
        total: 5,
        timestamp: '2024-01-15T10:30:00Z',
        store: 'TechStore'
      }
    }
  },

  // Large JSON (> 500 tokens)
  largeJson: {
    name: 'Large JSON - User Records',
    category: 'JSON-Large',
    data: {
      users: Array.from({ length: 20 }, (_, i) => ({
        id: 1000 + i,
        username: `user${i}`,
        email: `user${i}@example.com`,
        profile: {
          firstName: `First${i}`,
          lastName: `Last${i}`,
          age: 20 + (i % 50),
          country: ['USA', 'UK', 'Canada', 'Australia'][i % 4]
        },
        settings: {
          notifications: true,
          theme: 'dark',
          language: 'en'
        }
      }))
    }
  },

  // CSV-like data as JSON
  csvData: {
    name: 'CSV-like Data',
    category: 'CSV',
    data: {
      headers: ['Date', 'Product', 'Quantity', 'Price', 'Total'],
      rows: [
        ['2024-01-01', 'Widget A', 10, 25.50, 255.00],
        ['2024-01-02', 'Widget B', 5, 45.00, 225.00],
        ['2024-01-03', 'Widget C', 15, 12.75, 191.25],
        ['2024-01-04', 'Widget A', 8, 25.50, 204.00],
        ['2024-01-05', 'Widget D', 20, 8.99, 179.80]
      ]
    }
  },

  // Nested structure
  nestedData: {
    name: 'Deeply Nested Structure',
    category: 'JSON-Nested',
    data: {
      company: {
        name: 'TechCorp',
        departments: [
          {
            name: 'Engineering',
            teams: [
              { name: 'Frontend', members: 5, projects: ['WebApp', 'MobileApp'] },
              { name: 'Backend', members: 7, projects: ['API', 'Database'] }
            ]
          },
          {
            name: 'Design',
            teams: [
              { name: 'UX', members: 3, projects: ['Research', 'Prototyping'] },
              { name: 'UI', members: 4, projects: ['Design System', 'Branding'] }
            ]
          }
        ]
      }
    }
  },

  // Multilingual JSON - English
  multilingualEn: {
    name: 'Multilingual - English',
    category: 'Multilingual',
    data: {
      messages: [
        { id: 1, text: 'Hello, how are you today?', sender: 'Alice' },
        { id: 2, text: 'I am doing great, thanks for asking!', sender: 'Bob' },
        { id: 3, text: 'Would you like to grab coffee later?', sender: 'Alice' }
      ]
    }
  },

  // Multilingual JSON - Chinese
  multilingualZh: {
    name: 'Multilingual - Chinese',
    category: 'Multilingual',
    data: {
      messages: [
        { id: 1, text: '你好，今天過得怎麼樣？', sender: 'Alice' },
        { id: 2, text: '我很好，謝謝你的關心！', sender: 'Bob' },
        { id: 3, text: '等一下要一起喝咖啡嗎？', sender: 'Alice' }
      ]
    }
  },

  // Multilingual JSON - Japanese
  multilingualJa: {
    name: 'Multilingual - Japanese',
    category: 'Multilingual',
    data: {
      messages: [
        { id: 1, text: 'こんにちは、今日はどうですか？', sender: 'Alice' },
        { id: 2, text: '元気です、ありがとうございます！', sender: 'Bob' },
        { id: 3, text: '後でコーヒーを飲みませんか？', sender: 'Alice' }
      ]
    }
  },

  // Mixed language
  multilingualMixed: {
    name: 'Multilingual - Mixed',
    category: 'Multilingual',
    data: {
      messages: [
        { id: 1, text: 'Hello 你好 こんにちは', sender: 'Alice' },
        { id: 2, text: 'Welcome to our international platform!', sender: 'System' },
        { id: 3, text: '欢迎使用我们的平台 ようこそ', sender: 'System' }
      ]
    }
  },

  // Array of objects (common API response pattern)
  apiResponse: {
    name: 'API Response - Array of Objects',
    category: 'JSON-API',
    data: {
      status: 'success',
      data: [
        { id: 1, title: 'First Post', author: 'Alice', views: 1234, likes: 45 },
        { id: 2, title: 'Second Post', author: 'Bob', views: 5678, likes: 123 },
        { id: 3, title: 'Third Post', author: 'Charlie', views: 910, likes: 34 },
        { id: 4, title: 'Fourth Post', author: 'Diana', views: 2345, likes: 67 }
      ],
      meta: {
        total: 4,
        page: 1,
        perPage: 10
      }
    }
  }
};

function benchmarkSample(name: string, category: string, data: any): BenchmarkResult {
  const originalJson = JSON.stringify(data, null, 2);
  const originalTokens = optimizer.countTokens(originalJson);

  // Optimize
  const optimized = optimizer.optimize(originalJson, 'test-tool');
  const optimizedTokens = optimizer.countTokens(optimized.optimizedContent);

  const savings = originalTokens - optimizedTokens;
  const savingsPercent = (savings / originalTokens) * 100;

  return {
    name,
    category,
    originalTokens,
    optimizedTokens,
    savings,
    savingsPercent
  };
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function printResults(results: BenchmarkResult[]) {
  console.log('\n' + '='.repeat(100));
  console.log('TOKEN SAVINGS BENCHMARK RESULTS');
  console.log('='.repeat(100) + '\n');

  // Group by category
  const categories = [...new Set(results.map(r => r.category))];

  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    console.log(`\n📊 ${category}`);
    console.log('-'.repeat(100));

    categoryResults.forEach(result => {
      console.log(`\n  ${result.name}`);
      console.log(`    Original:   ${result.originalTokens.toString().padStart(6)} tokens`);
      console.log(`    Optimized:  ${result.optimizedTokens.toString().padStart(6)} tokens`);
      console.log(`    Savings:    ${result.savings.toString().padStart(6)} tokens (${formatPercent(result.savingsPercent)})`);
    });
  });

  // Overall statistics
  console.log('\n' + '='.repeat(100));
  console.log('OVERALL STATISTICS');
  console.log('='.repeat(100) + '\n');

  const savingsPercents = results.map(r => r.savingsPercent);
  const average = savingsPercents.reduce((a, b) => a + b, 0) / savingsPercents.length;
  const min = Math.min(...savingsPercents);
  const max = Math.max(...savingsPercents);

  // Calculate median
  const sorted = [...savingsPercents].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  console.log(`  Total Tests:        ${results.length}`);
  console.log(`  Average Savings:    ${formatPercent(average)}`);
  console.log(`  Median Savings:     ${formatPercent(median)}`);
  console.log(`  Min Savings:        ${formatPercent(min)}`);
  console.log(`  Max Savings:        ${formatPercent(max)}`);
  console.log(`  Range:              ${formatPercent(min)} - ${formatPercent(max)}`);

  // Category averages
  console.log('\n  Category Averages:');
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const categoryAvg = categoryResults.reduce((sum, r) => sum + r.savingsPercent, 0) / categoryResults.length;
    console.log(`    ${category.padEnd(20)}: ${formatPercent(categoryAvg)}`);
  });

  console.log('\n' + '='.repeat(100));
  console.log('RECOMMENDED CLAIMS FOR README');
  console.log('='.repeat(100) + '\n');

  console.log(`  Conservative:  "Reduces token usage by ${formatPercent(min)}-${formatPercent(max)}"`);
  console.log(`  Typical:       "Typically saves ${formatPercent(median)} of tokens"`);
  console.log(`  Average:       "Saves ${formatPercent(average)} on average"`);

  if (average >= 60) {
    console.log(`  ✅ Current claim "60%+ on average" is ACCURATE`);
  } else {
    console.log(`  ❌ Current claim "60%+ on average" is TOO HIGH`);
    console.log(`  💡 Suggested: "Saves ${Math.floor(average / 10) * 10}%+ on average"`);
  }

  console.log('\n' + '='.repeat(100) + '\n');
}

// Run benchmarks
console.log('🚀 Starting token savings benchmarks...\n');

const results: BenchmarkResult[] = [];

for (const [key, sample] of Object.entries(testData)) {
  try {
    const result = benchmarkSample(sample.name, sample.category, sample.data);
    results.push(result);
  } catch (error) {
    console.error(`❌ Error benchmarking ${sample.name}:`, error);
  }
}

printResults(results);
