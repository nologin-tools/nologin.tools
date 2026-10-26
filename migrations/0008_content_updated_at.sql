-- Existing dates stay unknown: do not mark the entire catalog as updated today.
ALTER TABLE tools ADD COLUMN content_updated_at integer;

-- Cover every canonical metadata write path, including approved edit suggestions.
-- IS NOT compares nulls safely and no-op updates leave the timestamp untouched.
CREATE TRIGGER tools_content_updated
AFTER UPDATE OF name, url, slug, description, core_task, seo_title, seo_description,
  seo_focus_keyword, seo_intent, seo_task_phrase, repo_url, twitter_url, github_url, discord_url
ON tools
WHEN OLD.name IS NOT NEW.name OR OLD.url IS NOT NEW.url OR OLD.slug IS NOT NEW.slug
  OR OLD.description IS NOT NEW.description OR OLD.core_task IS NOT NEW.core_task
  OR OLD.seo_title IS NOT NEW.seo_title OR OLD.seo_description IS NOT NEW.seo_description
  OR OLD.seo_focus_keyword IS NOT NEW.seo_focus_keyword OR OLD.seo_intent IS NOT NEW.seo_intent
  OR OLD.seo_task_phrase IS NOT NEW.seo_task_phrase OR OLD.repo_url IS NOT NEW.repo_url
  OR OLD.twitter_url IS NOT NEW.twitter_url OR OLD.github_url IS NOT NEW.github_url
  OR OLD.discord_url IS NOT NEW.discord_url
BEGIN
  UPDATE tools SET content_updated_at = unixepoch() WHERE id = NEW.id;
END;
