# Интеграция с Salebot: бот-диагностик МГТ/ЗГТ

## 1. Что у нас есть

- Endpoint (вебхук) `POST https://<ваш-домен>/api/bot/step`
- Принимает JSON, возвращает JSON с текстом следующего вопроса / финальным вердиктом
- Сессия по `sessionId` (внутри Salebot можно использовать `{{user_id}}` или случайный UUID)
- Опциональный заголовок `X-Salebot-Secret: <секрет>` (если в env выставлен `SALEBOT_SECRET`)

## 2. Шаг 0: переменные в Salebot

Создаём пользовательские переменные (Settings → Variables):
- `mht_session_id` — строка, значение `{{ random_uuid }}` или `{{ user.id }}`
- `mht_step_id` — строка
- `mht_last_answer_json` — строка / JSON

## 3. Шаг в Salebot: Блок «Внешний HTTP-запрос»

Для каждого «логического шага опроса» в Salebot создаём один блок:
1. **Action = HTTP Request → POST**
2. **URL**: `https://<ваш-домен>/api/bot/step`
3. **Headers**:
   - `Content-Type: application/json`
   - (опционально) `X-Salebot-Secret: my-secret-123`
4. **Body (raw JSON)**:

```json
{
  "sessionId": "{{mht_session_id}}",
  "answer": {{mht_last_answer_json}},
  "useLlm": true
}
```

где `mht_last_answer_json` — это JSON-ответ пользователя с ПРЕДЫДУЩЕГО шага (число / true-false / объект с чекбоксами).

5. **Save response to variables** — сохранить поля из ответа:
   - `nextStepId` → `mht_step_id`
   - `question` → `mht_question_text`
   - `answerType` → `mht_answer_type`
   - `options` → `mht_options_json`
   - `objectSchema` → `mht_object_schema_json`
   - `helpText` → `mht_help_text`
   - `isFinal` → `mht_is_final`
   - `summary` → `mht_final_summary`
   - `followupAvailable` → `mht_can_followup`

## 4. Форматы `mht_last_answer_json` на каждый шаг

| stepId | answerType | пример answer |
|---|---|---|
| `age` | number | `51` |
| `menopause_age` | number | `49` |
| `hot_flashes` | boolean | `true` |
| `vaginal_dryness` | boolean | `true` |
| `dyspareunia` | boolean | `false` |
| `sex_avoidance` | boolean | `false` |
| `gums` | multi (object key→bool) | `{"nocturia_gt1":true,"vulvar_discomfort":true}` |
| `body` | object | `{"heightCm":168,"weightKg":68,"smoking":false,"diabetes":false,"physicalActivity":"moderate"}` |
| `endometrium_usg` | multi | `{"endometrial_hyperplasia":false,"endometrial_polyp":false,"submucosal_myoma":false}` |
| `unexplained_pain` | boolean | `false` |
| `mht_allergy` | boolean | `false` |
| `cancers_1` | multi | `{"breast_cancer":false,"endometrial_cancer":false,"ovarian_cancer":false,"meningioma":false}` |
| `porphyria` | boolean | `false` |
| `endometriosis` | multi | `{"endometrioma":false,"infiltrative_endometriosis":false,"bowel_endometriosis":false}` |
| `undiagnosed_bleeding` | boolean | `false` |
| `breast_cancer_detail` | boolean | `false` |
| `gyn_cancer_detail` | boolean | `false` |
| `liver` | multi | `{"active_liver_disease":false,"liver_mht_cancellation":false}` |
| `thrombosis_cv` | multi | `{"venous_thrombosis":false,"dvt":false,"pe":false,"mi":false,"ischemic_stroke":false,"hemorrhagic_stroke":false}` |
| `risks_1` | multi | `{"migraine_without_aura":true,"hypertension":true}` |
| `onco_monitoring` | multi | `{"thyroid_cancer":true}` |
| `onco_negative` | multi | `{}` |
| `lipid` | multi | `{"high_cholesterol":true}` |
| `varicose` | multi | `{"varicose":true}` |
| followup | text (JSON-строка `"как долго можно пить ЗГТ?"`) | `"какая дозировка?"` |

Для boolean шагов в Salebot удобно поставить кнопки:
- label «Да» → JSON `true`
- label «Нет» → JSON `false`

Для number шагов: блок «Ввод числа» → сохранить как число → передать как JSON без кавычек.

Для multi-шагов: в Salebot выставить CheckboxGroup и сохранить выбранные ключи в формате `{ "ключ1": true, "ключ2": false }`. Список ключей всегда берётся из `mht_options_json` (поле `key`).

## 5. Flow Salebot (упрощённый псевдо-код)

```
[Block 1: Init]
  mht_session_id = random_uuid
  mht_last_answer_json = null
  → HTTP POST /api/bot/step  (body без answer — получим первый вопрос «возраст»)
  → условие isFinal == true → [Final block] иначе [Ask Step]

[Ask Step: цикл]
  показать текст mht_question_text + helpText (если есть)
  собрать ответ пользователя и сохранить в mht_last_answer_json (с нужным типом)
  → HTTP POST /api/bot/step
  → если isFinal == true → [Final block]
  иначе → [Ask Step]

[Final block]
  показать текст:
    ⚠️ ПРЕДВАРИТЕЛЬНОЕ ЗАКЛЮЧЕНИЕ. НЕ ЗАМЕНЯЕТ ВРАЧА.
    {{mht_final_summary}}
  если mht_can_followup == true → [Followup block]

[Followup block]
  ввод свободного текста «Ваш вопрос ИИ (не заменяет врача)»
  → POST body:
    { "sessionId":"{{mht_session_id}}", "followupQuestion":"{{user_text}}" }
  → показать followupReply из ответа
```

## 6. curl быстрый тест локально

```bash
# стартуем сессию, получаем шаг 1 (возраст)
curl -s -X POST http://localhost:3000/api/bot/step \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"demo-1"}'

# отвечаем на шаг age → 51
curl -s -X POST http://localhost:3000/api/bot/step \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"demo-1","answer":51}'

# ... далее аналогично по всем шагам
```

## 7. Деплой endpoint-а для Salebot

- Залить репозиторий на GitHub → import в Vercel
- В Vercel → Settings → Environment Variables выставить то же, что и в `.env.example`
- Прод-заголовок `X-Salebot-Secret` обязателен, чтобы чужой трафик не лез
