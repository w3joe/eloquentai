# Eloquent AI

## The Problem
Language learners often lack opportunities to practice conversational skills in realistic, personalized contexts. Traditional methods struggle to mimic the fluidity of native conversations or cater to a user's specific daily interactions, such as their profession or WhatsApp chats. Furthermore, obtaining real-time, phoneme-level pronunciation feedback is difficult and expensive without a dedicated human tutor.

## The Solution
**Eloquent** is an interactive, web-based language learning application that generates hyper-personalized conversational scenarios.
- **Google Gemini 2.5 Flash** dynamically creates scenarios based on a user's profile and real WhatsApp message history, and generates comprehensive post-conversation feedback.
- **ElevenLabs** powers a low-latency conversational AI agent that roleplays the scenarios, allowing learners to practice natural speaking.
- **Azure Speech Services** provides an integrated pronunciation engine, listening via the microphone to deliver precise, phoneme-level assessments and live contextual updates to the tutor to guide the user.

## Architecture
```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Client
    participant Gemini as Google Gemini
    participant Voice as ElevenLabs AI
    participant Speech as Azure Speech

    User->>Frontend: Submits Profile & Context
    Frontend->>Gemini: Generate personalized learning scenarios
    Gemini-->>Frontend: Return 3 unique scenarios
    User->>Frontend: Selects scenario to begin conversation

    rect rgb(230, 240, 255)
        note right of Frontend: Real-time Conversation Loop
        User->>Frontend: Speaks into microphone
        Frontend->>Voice: Stream audio via WebSocket
        Frontend->>Speech: Stream PCM audio for pronunciation assessment
        Voice-->>Frontend: Returns AI response (Audio Stream & Transcript)
        Speech-->>Frontend: Returns word & phoneme accuracy scores
        Frontend->>Voice: Send context update on mispronunciations
    end

    User->>Frontend: Ends conversation
    Frontend->>Gemini: Generate feedback from transcript & duration
    Gemini-->>Frontend: Return fluency score, corrections & tips
```

## Welcome to your Lovable project

### Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
