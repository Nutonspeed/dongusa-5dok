# Performance Benchmark Workflow

This directory contains the performance benchmark workflow and related scripts to test and measure the efficiency of the codebase.

## Overview

The performance benchmark workflow automatically:
- Runs comprehensive benchmark tests
- Generates performance reports
- Creates artifacts for analysis
- Provides feedback on pull requests

## Files

### Workflow
- `.github/workflows/performance-benchmark.yml` - Main GitHub Actions workflow

### Scripts
- `scripts/run-benchmark-tests.ts` - Performance benchmark test runner

### Reports
- `docs/performance/reports/` - Generated performance reports (JSON and Markdown)

## Benchmark Tests

The workflow runs the following performance tests:

1. **Database Query Performance**
   - Average query time
   - Slow query detection
   - Query throughput measurement
   - Connection pool utilization

2. **API Response Times** 
   - Average response time
   - P95 and P99 percentiles
   - Success rate monitoring
   - Throughput measurement

3. **Frontend Bundle Size**
   - Total bundle size analysis
   - JavaScript, CSS, and image sizes
   - Bundle optimization recommendations

4. **Memory Usage**
   - Heap memory usage
   - External memory consumption
   - Memory optimization insights

5. **Lighthouse Performance Audit**
   - Core Web Vitals
   - Performance score
   - Best practices validation

## Usage

### Automatic Execution

The workflow runs automatically on:
- Push to main branch
- Pull requests to main
- Weekly schedule (Sundays at 2 AM UTC)
- Manual trigger via GitHub Actions

### Manual Execution

Run benchmark tests locally:

```bash
# Run benchmark tests
npm run benchmark

# Run with report generation message
npm run benchmark:report
```

### Generated Artifacts

Each workflow run generates:
- Performance benchmark reports (JSON and Markdown)
- Lighthouse audit results
- Test artifacts and logs

Artifacts are retained for 30 days for reports and 7 days for test files.

## Report Structure

### JSON Report
```json
{
  "timestamp": "ISO 8601 date",
  "summary": {
    "testsRun": 4,
    "overallScore": 100,
    "criticalIssues": []
  },
  "results": [...],
  "globalRecommendations": [...]
}
```

### Markdown Report
Human-readable format with:
- Executive summary
- Individual test results
- Recommendations
- Critical issues (if any)

## Performance Thresholds

The benchmark tests use these baseline expectations:
- Database queries: < 100ms average
- API responses: < 200ms average
- Bundle size: < 500KB gzipped
- Memory usage: Stable and optimized

## Customization

### Adding New Benchmarks

To add new benchmark tests:

1. Add the test function to `scripts/run-benchmark-tests.ts`
2. Include it in the main `runBenchmarkTests()` function
3. Update the report generation to handle new metrics

### Modifying Thresholds

Adjust performance thresholds in the benchmark functions based on your application's requirements.

### Workflow Configuration

Modify `.github/workflows/performance-benchmark.yml` to:
- Change execution triggers
- Adjust artifact retention
- Add additional tools or tests

## Integration

### Pull Request Comments

On pull requests, the workflow automatically posts a comment with:
- Overall performance score
- Number of tests run
- Critical issues count
- Link to detailed artifacts

### Monitoring

Use the generated reports to:
- Track performance trends over time
- Identify performance regressions
- Monitor system health
- Set up alerts for critical issues

## Troubleshooting

### Common Issues

1. **Build failures**: Ensure all dependencies are installed and environment variables are set
2. **Network timeouts**: Check internet connectivity for external dependencies
3. **Memory issues**: Monitor system resources during test execution

### Debug Mode

Enable debug logging by setting environment variables in the workflow:
```yaml
env:
  DEBUG: 1
  VERBOSE: true
```

## Contributing

When contributing to performance tests:
1. Ensure tests are deterministic and reliable
2. Add appropriate error handling
3. Update documentation for new tests
4. Test locally before submitting changes

## Related Files

- `lib/comprehensive-performance-testing.ts` - Core performance testing framework
- `scripts/performance-validation.ts` - Performance validation utilities  
- `lighthouse.config.js` - Lighthouse configuration
- `.github/workflows/greenline.yml` - Main CI workflow