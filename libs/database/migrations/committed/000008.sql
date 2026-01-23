--! Previous: sha1:a95246cfec4354dee8a53313a7460c6d654cc707
--! Hash: sha1:a1009b19cc250295a3148fc0f57c6b1e59f2211b

-- Enter migration here

CREATE INDEX IF NOT EXISTS app_public_topics_forum_id ON "app_public"."topics"("forum_id");

CREATE INDEX IF NOT EXISTS app_public_user_authentications_user_id ON "app_public"."user_authentications"("user_id");

CREATE INDEX IF NOT EXISTS app_public_topics_author_id ON "app_public"."topics"("author_id");

CREATE INDEX IF NOT EXISTS app_public_posts_author_id ON "app_public"."posts"("author_id");

CREATE INDEX IF NOT EXISTS app_public_posts_topic_id ON "app_public"."posts"("topic_id");
