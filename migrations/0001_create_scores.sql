-- RN-0001: scores shown in the public ranking. Rules about the nickname (length, characters, filter) belong to the
-- next epic, with their own RN and migration.
create table scores (
  id bigint generated always as identity primary key,
  nickname text not null,
  points integer not null check (points >= 0),
  created_at timestamptz not null default now()
);

create index scores_ranking_idx on scores (points desc, created_at asc);
