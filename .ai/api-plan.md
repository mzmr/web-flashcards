# REST API Plan

## 1. Resources

- **User**: Represents application users. Maps to the `users` table.
- **Card Set**: Represents a collection of flashcards. Maps to the `card_sets` table.
- **Card**: Represents an individual flashcard with a front and back. Maps to the `cards` table.
- **Generation**: Represents the process of generating flashcards via AI. Maps to the `generations` table.
- **Generation Error**: Represents errors encountered during the generation process. Maps to the `generation_errors` table.

## 2. Endpoints

### Card Set Endpoints

1. **List Card Sets**

   - **Method**: GET
   - **URL**: `/api/card-sets`
   - **Description**: Retrieve a paginated list of card sets for the authenticated user.
   - **Query Parameters**:
     - `page` (optional, default = 1)
     - `limit` (optional, default = 10)
     - `sort` (optional)
   - **Response Payload**:
     ```json
     {
       "cardSets": [
         {
           "id": "uuid",
           "name": "Set Name",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 10,
         "total": 100
       }
     }
     ```

2. **Create Card Set**

   - **Method**: POST
   - **URL**: `/api/card-sets`
   - **Description**: Create a new card set.
   - **Request Payload**:
     ```json
     {
       "name": "My Flashcards"
     }
     ```
   - **Validations**:
     - The "name" field is required.
     - Must be a non-empty string.
     - Maximum length: 100 characters.
   - **Response**:
     - **201 Created**: Returns the created card set.
       ```json
       {
         "id": "uuid",
         "name": "My Flashcards",
         "created_at": "timestamp",
         "updated_at": "timestamp"
       }
       ```
     - **400 Bad Request**: Validation errors.

3. **Get Card Set Details**

   - **Method**: GET
   - **URL**: `/api/card-sets/{cardSetId}`
   - **Description**: Retrieve details for a specific card set, including its cards.
   - **Response**:
     - **200 OK**: Returns card set details.
       ```json
       {
         "id": "uuid",
         "name": "Set Name",
         "created_at": "timestamp",
         "updated_at": "timestamp",
         "cards": [
           {
             "id": "uuid",
             "front": "Front text",
             "back": "Back text",
             "source": "ai_generated",
             "generation_id": "uuid",
             "created_at": "timestamp",
             "updated_at": "timestamp"
           }
         ]
       }
       ```
     - **404 Not Found**: Card set does not exist.

4. **Update Card Set**

   - **Method**: PUT
   - **URL**: `/api/card-sets/{cardSetId}`
   - **Description**: Update the name of a card set.
   - **Request Payload**:
     ```json
     {
       "name": "Updated Set Name"
     }
     ```
   - **Validations**:
     - The "name" field is required.
     - Must be a non-empty string.
     - Maximum length: 100 characters.
   - **Response**:
     - **200 OK**: Returns the updated card set.
       ```json
       {
         "id": "uuid",
         "name": "Updated Set Name",
         "created_at": "timestamp",
         "updated_at": "timestamp"
       }
       ```
     - **400 Bad Request**: Validation errors.
     - **404 Not Found**: Card set does not exist.

5. **Delete Card Set**
   - **Method**: DELETE
   - **URL**: `/api/card-sets/{cardSetId}`
   - **Description**: Delete a card set and all associated cards.
   - **Response**:
     - **200 OK**: Successfully deleted.
       ```json
       {
         "message": "Card set deleted successfully"
       }
       ```
     - **404 Not Found**: Card set does not exist.

### Card Endpoints (Nested under Card Set)

1. **List Cards**

   - **Method**: GET
   - **URL**: `/api/card-sets/{cardSetId}/cards`
   - **Description**: Retrieve a paginated list of cards within a card set.
   - **Query Parameters**:
     - `page` (optional, default = 1)
     - `limit` (optional, default = 10)
   - **Response Payload**:
     ```json
     {
       "cards": [
         {
           "id": "uuid",
           "front": "text",
           "back": "text",
           "source": "ai_generated",
           "generation_id": "uuid",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 10,
         "total": 50
       }
     }
     ```

2. **Create Cards**

   - **Method**: POST
   - **URL**: `/api/card-sets/{cardSetId}/cards`
   - **Description**: Add one or more cards to a card set. Cards can come from different sources (AI-generated, AI-edited, or user-created). For AI-generated and AI-edited cards, generation_id must be provided.
   - **Request Payload**:
     ```json
     {
       "cards": [
         {
           "front": "Front text (max 300 characters)",
           "back": "Back text (max 300 characters)",
           "source": "ai_generated | ai_edited | user_created",
           "generation_id": "uuid (required when source is ai_generated or ai_edited)"
         }
       ]
     }
     ```
   - **Validations**:
     - For each card in the "cards" array:
       - "front": required, non-empty, maximum 300 characters.
       - "back": required, non-empty, maximum 300 characters.
       - "source": required, must be one of "ai_generated", "ai_edited", or "user_created".
       - If "source" is "ai_generated" or "ai_edited", "generation_id" must be provided and be a valid UUID.
   - **Response**:
     - **201 Created**: Returns the created cards.
       ```json
       {
         "cards": [
           {
             "id": "uuid",
             "front": "Front text (max 300 characters)",
             "back": "Back text (max 300 characters)",
             "source": "ai_generated",
             "generation_id": "uuid",
             "created_at": "timestamp",
             "updated_at": "timestamp"
           }
         ]
       }
       ```
     - **400 Bad Request**: Validation errors, e.g., text length exceeding 300 characters, invalid source value, or missing generation_id for AI-related cards.

3. **Update Card**

   - **Method**: PUT
   - **URL**: `/api/card-sets/{cardSetId}/cards/{cardId}`
   - **Description**: Update an existing card.
   - **Request Payload**:
     ```json
     {
       "front": "Updated front text",
       "back": "Updated back text"
     }
     ```
   - **Validations**:
     - "front": required, non-empty, maximum 300 characters.
     - "back": required, non-empty, maximum 300 characters.
   - **Response**:
     - **200 OK**: Returns the updated card.
       ```json
       {
         "id": "uuid",
         "front": "Updated front text",
         "back": "Updated back text",
         "source": "ai_generated",
         "generation_id": "uuid",
         "created_at": "timestamp",
         "updated_at": "timestamp"
       }
       ```
     - **400 Bad Request**: Validation errors.
     - **404 Not Found**: Card does not exist.

4. **Delete Card**
   - **Method**: DELETE
   - **URL**: `/api/card-sets/{cardSetId}/cards/{cardId}`
   - **Description**: Remove a card from a card set.
   - **Response**:
     - **200 OK**: Successfully deleted.
       ```json
       {
         "message": "Card deleted successfully"
       }
       ```
     - **404 Not Found**: Card does not exist.

### Generation Endpoints

1. **Generate Flashcards (AI)**

   - **Method**: POST
   - **URL**: `/api/generations`
   - **Description**: Generate a temporary set of flashcards based on user-provided text.
   - **Request Payload**:
     ```json
     {
       "input_text": "Text between 1000 and 10000 characters",
       "card_set_id": "UUID"
     }
     ```
   - **Validations**:
     - "input_text": required; length must be between 1000 and 10000 characters.
     - "card_set_id": required; must be a valid UUID.
   - **Response**:
     - **200 OK**: Returns a preview of generated flashcards along with generation metadata.
       ```json
       {
         "generation_id": "uuid",
         "cards": [
           {
             "front": "Generated front text",
             "back": "Generated back text"
           }
         ],
         "created_at": "timestamp",
         "updated_at": "timestamp"
       }
       ```
     - **400 Bad Request**: Validation errors (e.g., text length not within required bounds).

2. **Get Generation Details**
   - **Method**: GET
   - **URL**: `/api/generations/{generation_id}`
   - **Description**: Retrieve details of a flashcard generation process including flashcards and metadata.
   - **Response**:
     - **200 OK**: Returns generation details.
       ```json
       {
         "generation_id": "uuid",
         "input_text": "Provided text",
         "cards": [
           {
             "id": "uuid",
             "front": "Generated front text",
             "back": "Generated back text",
             "source": "ai_generated",
             "generation_id": "uuid",
             "created_at": "timestamp",
             "updated_at": "timestamp"
           }
         ],
         "metadata": {
           "duration": 5,
           "generated_count": 10
         },
         "created_at": "timestamp",
         "updated_at": "timestamp"
       }
       ```
     - **404 Not Found**: Generation not found.

## 3. Authentication and Authorization

- The API will use a token-based authentication system (e.g., JWT) provided by Supabase Auth. Each request must include a valid token in the `Authorization` header.
- Access to resources is restricted by user, enforced by database Row-Level Security (RLS) rules based on the `user_id` field.

## 4. Validation and Business Logic

- **Input Validation**:

  - Registration and login endpoints require valid email and password.
  - Flashcard generation requires an `input_text` length between 1000 and 10000 characters.
  - Card creation and updates enforce a maximum limit of 300 characters for both the `front` and `back` fields.

- **Business Logic**:
  - AI-generated flashcards are temporary and only persisted after user confirmation.
  - Updating any resource updates the corresponding `updated_at` timestamp.
  - Deleting a card set cascades to delete all associated cards.
