create or replace function exec_sql(sql_query text)
returns void as $$
begin
  execute sql_query;
end;
$$ language plpgsql security definer;
