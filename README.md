## GitHut

GitHut (http://githut.info) is an attempt to visualize and explore the complexity of the universe of programming languages used across the repositories hosted on GitHub.

Programming languages are not simply the tool developers use to create programs or express algorithms but also instruments to code and decode creativity. By observing the history of languages we can enjoy the quest of humankind for a better way to solve problems, to facilitate collaboration between people and to reuse the effort of others.

Github is the largest code host in the world, with 3.5 million users. It's the place where the open-source development community offers access to most of its projects. By analyzing how languages are used in GitHub it is possible to understand the popularity of programming languages among developers and also to discover the unique characteristics of each language. 

The visualization is based on two type of visualization: a Parallel Coordinates chart and a Small Multiples visualization.

Data is from Github Archive (http://www.githubarchive.org/).

### Web Site

GitHut is published at **http://githut.info**

### Queries

GitHub Archive data is also available on Google BigQuery. Below are the two queries used to collect the data for the Parallel Coordinates and Small Multiples visualizations:

#### Parallel Coordinates

Multiple information grouped by language for a defined quarter

```sql
select 
  repository_language,
  type,
  count(distinct(repository_url)) as active_repos_by_url,
  count(repository_language) as events,
  YEAR(created_at) as year,
  QUARTER(created_at) as quarter
from [githubarchive:github.timeline]
where
    (
      type = 'PushEvent'
      OR type = 'ForkEvent'
      OR (type = 'IssuesEvent' AND (payload_action="opened" OR payload_action=="reopened"))
      OR (type = 'CreateEvent' AND payload_ref_type="repository")
      OR type = 'WatchEvent'
    )
    AND repository_language !=''
    AND repository_url != ''
    AND YEAR(created_at)= 2014
    AND QUARTER(created_at)=1
group by 
  repository_language,
  type,
  year,
  quarter
```

#### Small Multiples

Count of active repositories by quarter

```sql
select
  repository_language,
  count(distinct(repository_url)) as active_repos_by_url,
  YEAR(created_at) as year,
  QUARTER(created_at) as quarter,
from [githubarchive:github.timeline]
where
    type="PushEvent"
group by
  repository_language,
  year,
  quarter
order by
  repository_language,
  year DESC,
  quarter DESC
```

### License

The content of this project itself is licensed under the [Creative Commons Attribution 4.0 license](http://creativecommons.org/licenses/by-nc-nd/4.0/), and the underlying source code used to format and display that content is licensed under the [MIT license](http://opensource.org/licenses/mit-license.php).
