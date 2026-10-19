-- The editor-managed D1 table is the complete authoring model vocabulary.
-- These rows move the former code defaults into D1; the checked-in JS list is
-- now only a frozen fallback snapshot refreshed by Freeze.
CREATE TABLE authoring_model_suggestion_catalog (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL
) STRICT;

WITH seed(position, label) AS (
  VALUES
    (1, 'Composer 2.5'),
    (2, 'Claude Opus 5'),
    (3, 'Claude Sonnet 5'),
    (4, 'Claude Sonnet 4.6'),
    (5, 'Claude Opus 4.8'),
    (6, 'Claude Opus 4.7'),
    (7, 'Claude Opus 4.6'),
    (8, 'Claude Opus 4.5'),
    (9, 'Claude Sonnet 4.5'),
    (10, 'Claude Sonnet 4'),
    (11, 'Claude Haiku 4.5'),
    (12, 'Claude Fable 5'),
    (13, 'GPT-5.6 Sol'),
    (14, 'GPT-5.6 Terra'),
    (15, 'GPT-5.6 Luna'),
    (16, 'GPT-5.5'),
    (17, 'GPT-5.4'),
    (18, 'GPT-5.4 Mini'),
    (19, 'GPT-5.4 Nano'),
    (20, 'GPT-5.2'),
    (21, 'GPT-5.1'),
    (22, 'GPT-5 Mini'),
    (23, 'Gemini 3.7 Flash'),
    (24, 'Gemini 3.6 Flash'),
    (25, 'Gemini 3.5 Flash'),
    (26, 'Gemini 3.1 Pro'),
    (27, 'Gemini 3 Flash'),
    (28, 'Gemini 2.5 Flash'),
    (29, 'Cursor Grok 4.6'),
    (30, 'Cursor Grok 4.5'),
    (31, 'Codex 5.3'),
    (32, 'Kimi K3'),
    (33, 'Kimi K2.7 Code'),
    (34, 'DeepSeek V4.1 Flash'),
    (35, 'GLM 4.7'),
    (36, 'GLM 4.7 Flash'),
    (37, 'GLM 5 Turbo'),
    (38, 'GLM 5.2'),
    (39, 'GLM 5.2 Highspeed'),
    (40, 'GLM 5.3'),
    (41, 'GLM 5.3 Highspeed'),
    (42, 'GLM 5.3 Flash'),
    (43, 'Spark 2.0'),
    (44, 'Spark 1.3')
)
INSERT INTO authoring_model_suggestions (label, created_by, created_at)
SELECT label, 'migration:0035',
       printf('2000-01-01T00:%02d:00.000Z', position)
FROM seed
WHERE 1
ON CONFLICT(label) DO NOTHING;

INSERT INTO authoring_model_suggestion_catalog (id, version)
VALUES (1, 1);
