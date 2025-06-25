# EchoRoom

## Inspiration
EchoRoom was created to provide a safe, supportive space for people to connect authentically through chat-based group rooms. In a world where digital communication can feel isolating, we wanted to build a platform that prioritizes emotional well-being, empathy, and meaningful conversation. Our mission is to make it easy for anyone to find a community that resonates with their current mood, and to empower users with innovative AI tools for deeper engagement—whether through text, video, or voice.

## What it does
EchoRoom is a next-generation chat room platform designed for emotional connection and mental wellness. Users join mood-based chat rooms (Hopeful, Lonely, Motivated, Calm, Loving, Joyful, Books) to engage in real-time, text-based group conversations. The platform offers:

- **Mood-Based Chat Rooms**: Instantly join chat rooms that match your current feelings, each with its own supportive community and vibe.
- **Tavus-Enabled Video Sessions**: For users who want a richer experience, EchoRoom integrates Tavus AI avatars. Users can join video call sessions where a Tavus avatar participates in the conversation, offering guidance, prompts, and empathetic engagement.
- **ElevenLabs Conversational AI**: Users who prefer voice can interact with ElevenLabs-powered conversational AI, which joins the chat as a voice participant, responding naturally and empathetically.
- **Safe & Anonymous**: No registration required; users choose anonymous identities and control their participation.
- **Live Features**: Typing indicators, message reactions, real-time participant updates, and persistent chat history.
- **Mobile-Optimized**: Touch-friendly design, swipe gestures, and quick reactions for mobile users.
- **Analytics Dashboard**: Post-session summaries and user analytics to help users reflect on their experiences.

## How we built it
- **Frontend**: Vite + React 18 + TypeScript, styled with Tailwind CSS and a custom design system. UI components use Radix UI primitives, Framer Motion for animations, and Lucide React for icons. State is managed via React Context API and useReducer.
- **Real-Time Chat**: Socket.IO Client for WebSocket-based real-time messaging and participant updates.
- **Tavus Integration**: Video call sessions with AI avatars that join and engage in group conversations, powered by Tavus.
- **ElevenLabs Integration**: Conversational AI that joins as a voice participant, engaging users who prefer voice interaction.
- **Backend**: Node.js + Express REST API for session, participant, and message management. PostgreSQL database with row-level security and privacy policies.
- **Project Structure**:
  - `src/components/`: UI, chat, video, layout, dashboard
  - `src/pages/`: Home, Welcome, Room, Dashboard
  - `src/hooks/`: useSocket, useChat, useRoom
  - `src/context/`: SocketContext, ChatContext, RoomContext
  - `src/lib/`: socket, chatUtils, videoUtils
  - `src/types/`: chat, room, session, socket
  - `src/styles/`: Global CSS
- **DevOps**: Vite for fast builds, TypeScript for type safety, ESLint and Biome for code quality.

## Challenges we ran into
- **Real-Time Sync**: Ensuring seamless synchronization between chat, video, and AI participants, especially with multiple concurrent users and mood-based rooms.
- **AI Avatar Engagement**: Integrating Tavus avatars to participate naturally in video calls and contribute meaningfully to group conversations.
- **Conversational AI Voice**: Making ElevenLabs AI feel like a genuine, empathetic participant in voice-enabled rooms.
- **Privacy & Safety**: Balancing anonymity with persistent session state and moderation needs.
- **Scalability**: Architecting the backend and database for horizontal scaling and high concurrency.
- **Mobile Experience**: Designing a beautiful, production-worthy UI that works flawlessly on all devices.

## Accomplishments that we're proud of
- **Seamless Multi-Modal Experience**: Achieved a smooth blend of chat, video, and AI-powered voice, with instant updates and beautiful transitions.
- **AI-Driven Engagement**: Developed robust integrations with Tavus and ElevenLabs, enabling AI avatars and voice bots to participate in real-time group conversations.
- **Production-Ready UI**: Built a visually stunning, accessible, and mobile-optimized interface using modern React and Tailwind best practices.
- **Scalable, Secure Backend**: Designed a backend with row-level security, audit trails, and extensible APIs for future features.
- **User Empowerment**: Created a platform where users feel safe, heard, and able to express themselves authentically.
- **Analytics & Insights**: Added dashboards and session summaries to help users reflect on their experiences and growth.

## What we learned
- **Emotional Design Matters**: UI/UX decisions deeply impact how safe and welcome users feel in digital spaces.
- **AI as a Social Participant**: Integrating AI avatars and voice bots requires careful design to ensure they enhance, rather than disrupt, group dynamics.
- **Real-Time Complexity**: Building reliable, real-time systems requires careful handling of edge cases, reconnections, and state sync.
- **Privacy by Design**: Anonymity and safety can coexist with persistent, meaningful user experiences through thoughtful architecture.
- **Iterative Development**: Frequent user feedback and rapid prototyping were key to refining both features and emotional resonance.

## What's next for EchoRoom
- **Advanced AI Moderation**: Integrate more sophisticated AI for real-time moderation, sentiment analysis, and support escalation.
- **Voice-to-Text & Accessibility**: Add live transcription and translation for greater inclusivity.
- **Expanded Mood Rooms**: Introduce more moods, themed events, and community-driven spaces.
- **Deeper Analytics**: Provide users with personal growth insights and conversation highlights.
- **Mobile App**: Launch native mobile apps for iOS and Android.
- **Integrations**: Connect with mental health resources, support groups, and wellness partners.
- **Open API**: Allow third-party integrations and community-built plugins.
- **Gamification**: Reward positive participation and community support with badges and achievements.

---

EchoRoom is more than just a chat app—it's a movement to make the digital world a kinder, more connected place. Join us and find your voice. 