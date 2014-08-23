SELECT 
  repository_language,
  MAX(active_repos_by_url) AS active_repos_by_url,
  MAX(lang_usage) AS lang_usage,
  MAX(median_size) AS median_size,
  MAX(median_forks) AS median_forks,
  MAX(median_open_issues) AS median_open_issues,
  MAX(median_watchers) AS median_watchers
FROM (
  SELECT  
      repository_language,
      count(distinct(repository_url)) OVER (PARTITION BY repository_language) AS active_repos_by_url,
      count(repository_language) OVER (PARTITION BY repository_language) AS lang_usage,
      percentile_cont(0.5) OVER (PARTITION BY repository_language ORDER BY repository_size) AS median_size,
      percentile_cont(0.5) OVER (PARTITION BY repository_language ORDER BY repository_forks) AS median_forks,
      percentile_cont(0.5) OVER (PARTITION BY repository_language ORDER BY repository_open_issues) AS median_open_issues,
      percentile_cont(0.5) OVER (PARTITION BY repository_language ORDER BY repository_watchers) AS median_watchers,
  from
      [githubarchive:github.timeline]
  WHERE
      repository_language != ''
      and repository_url != ''
      and PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2014-01-01 00:00:00')
      and PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2014-04-01 00:00:00')
)
group each by repository_language