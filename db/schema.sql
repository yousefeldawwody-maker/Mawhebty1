create table if not exists users (id serial primary key, name text not null, age int, points int default 0, streak int default 0);
create table if not exists talents (id serial primary key, slug text unique not null, name text not null, name_ar text not null, description text not null, description_ar text not null, category text, category_ar text, icon text, accent text, total_lessons int default 1);
create table if not exists assessment_questions (id serial primary key, prompt text not null, prompt_ar text not null, options jsonb not null);
create table if not exists assessment_attempts (id serial primary key, user_id int references users(id), answers jsonb not null, primary_talent text, score int, created_at timestamptz default now());
create table if not exists progress_records (id serial primary key, user_id int references users(id), talent_slug text not null, completed_lessons int default 0, total_lessons int default 1, unique(user_id,talent_slug));
create table if not exists achievements (id serial primary key, user_id int references users(id), title text not null, title_ar text not null, icon text, earned_at timestamptz default now());
create table if not exists notifications (id serial primary key, user_id int references users(id), title text not null, body text not null, read boolean default false);
