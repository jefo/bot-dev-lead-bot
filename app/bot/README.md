# Bot for Lead Generation (Extended Version)

This is an extended version of the Telegram bot designed to generate leads for bot development services. It follows the SotaJS framework principles with a clean architecture based on Domain-Driven Design and Hexagonal Architecture.

## Extended Architecture

The bot now supports a comprehensive lead generation workflow with 6 distinct blocks:

### Block 1: Entry Point (Segmentation)
- Welcome message and user segmentation
- Three main paths:
  - Path A: "I have a task for a bot" (Qualification)
  - Path B: "Want to see examples/features" (Demonstration)
  - Path C: "Contact the developer" (Direct contact)

### Block 2: Qualification Path (Path A)
- Step 2.1: Determine the type of task (Client's pain point)
- Step 2.2: Determine the business context (Niche)
- Step 2.3: Assess the scale (Seriousness of intentions)
- Step 2.4: Value delivery and Pre-CTA

### Block 3: Demonstration Path (Path B)
- Gallery of bot capabilities
- Feature demonstrations
- Transition to qualification path

### Block 4: Direct Contact (Lead Capture)
- Final confirmation and message collection
- Lead transfer to developer

### Block 5: Warmup (For "thinkers")
- Offer subscription to useful materials
- Add to "warmup" mailing list

### Block 6: Lead Transfer
- Data collection and structuring
- Lead scoring and card creation
- Transfer to developer

## Extended Domain Model

### New Entities

1. **LeadProfile** - Potential client profile
   - User ID and Telegram username
   - Selected path
   - Identified pain point
   - Niche
   - Scale
   - User message
   - Lead temperature

2. **LeadScoring** - Lead quality assessment system
   - Temperature assignment rules
   - Scoring algorithm

3. **Demonstration** - Demonstration system
   - Bot capability catalog
   - Media content for demonstrations

### Updated Entities

1. **DialogSession** - Extended dialog session
   - Support for all workflow blocks
   - User path tracking
   - Intermediate result storage

2. **User** - Extended user
   - Subscription to "warmup" mailing
   - Interaction history
   - Funnel status

## Extended DTOs

### Platform-agnostic DTOs

1. **SegmentationChoiceDto** - Segmentation choices
2. **QualificationQuestionDto** - Qualification questions
3. **DemonstrationGalleryDto** - Demonstration gallery
4. **LeadCaptureDto** - Lead capture
5. **WarmupSubscriptionDto** - Warmup subscription
6. **LeadCardDto** - Lead card

## New Ports

### Driven Ports

1. **showSegmentationPort** - Display segmentation options
2. **showQualificationQuestionPort** - Display qualification questions
3. **showDemonstrationGalleryPort** - Display demonstration gallery
4. **showDemonstrationDetailPort** - Display demonstration details
5. **captureLeadPort** - Lead capture
6. **showWarmupSubscriptionPort** - Offer warmup subscription
7. **transferLeadPort** - Transfer lead to developer

### Driving Ports

1. **segmentationChoicePort** - Receive segmentation choice
2. **qualificationAnswerPort** - Receive qualification answers
3. **demonstrationChoicePort** - Receive demonstration choice
4. **leadSubmissionPort** - Receive user submission
5. **warmupSubscriptionPort** - Receive subscription consent

## Use Cases

### Main Use Cases

1. **handleSegmentationUseCase** - Handle user segmentation
2. **handleQualificationUseCase** - Handle qualification path
3. **handleDemonstrationUseCase** - Handle demonstration path
4. **handleLeadCaptureUseCase** - Handle lead capture
5. **handleWarmupSubscriptionUseCase** - Handle warmup subscription
6. **transferLeadUseCase** - Transfer lead to developer

## Driving Adapters

### Telegram Driving Adapter
- Transform all new DTOs to Telegram-specific format
- Handle all new callbacks
- Integrate with Telegram Bot API

## Driven Adapters

### Lead Transfer Adapter
- Create lead card
- Send to developer via Telegram
- Log transfer

### Warmup Subscription Adapter
- Add user to mailing list
- Manage subscription

### Demonstration Content Adapter
- Store and provide media content
- Manage demonstration gallery

## Data Flow

1. **Telegram API** sends platform-specific webhook to **Telegram Driving Adapter**
2. **Telegram Driving Adapter** transforms webhook data to platform-agnostic DTO
3. **Telegram Driving Adapter** calls appropriate **Use Case** with platform-agnostic data
4. **Use Case** orchestrates business logic using **Domain Entities**
5. **Use Case** returns platform-agnostic DTO (SegmentationChoiceDto, QualificationQuestionDto, etc.)
6. **Telegram Driving Adapter** transforms platform-agnostic DTO to Telegram-specific format
7. **Telegram Driving Adapter** sends response to **Telegram API**

## Testing

The bot includes comprehensive integration tests to ensure proper functionality:

### Test Categories

1. **Happy Path Tests** - Test the main successful scenarios for each workflow
2. **Edge Case Tests** - Test boundary conditions and error handling
3. **Scenario Tests** - Test specific business scenarios for different user types
4. **Data Transfer Tests** - Verify correct data flow between layers

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/application/use-cases/integration-tests.happy-path.ts
```

### Test Coverage

The tests cover:

- **User Segmentation** - All three main user paths
- **Qualification Flow** - Complete multi-step qualification process
- **Demonstration Flow** - Feature gallery and detailed demonstrations
- **Lead Capture** - Message collection and confirmation
- **Warmup Subscription** - User subscription management
- **Lead Transfer** - Complete lead card creation and transfer
- **Error Handling** - Invalid inputs and edge cases
- **Data Persistence** - Correct storage and retrieval of session data
- **Data Flow** - Proper transfer of information between components

This extended architecture ensures:
- Comprehensive lead qualification process
- Multiple engagement paths for different user types
- Proper lead scoring and transfer
- Warmup mailing for "thinking" users
- Full platform-agnostic architecture with clear separation of concerns
- Thorough testing of all components and workflows