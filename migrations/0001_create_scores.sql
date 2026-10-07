create table scores (
  id integer primary key,
  nickname text not null,
  points integer not null check (points between 0 and 2147483647),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    check (julianday(created_at) is not null and substr(created_at, -1) = 'Z')
) strict;

create index scores_ranking_idx on scores (points desc, julianday(created_at) asc, id asc);
