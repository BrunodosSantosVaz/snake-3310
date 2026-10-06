-- RN-0001: scores shown in the public ranking.
create table scores (
  id bigint generated always as identity primary key,
  nickname text not null check (char_length(nickname) between 1 and 12),
  points integer not null check (points >= 0),
  created_at timestamptz not null default now()
);

create index scores_ranking_idx on scores (points desc, created_at asc);
