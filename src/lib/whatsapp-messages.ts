export interface WhatsAppMessage {
  id: string;
  sender: 'student' | 'rider' | 'support' | 'restaurant';
  senderName: string;
  text: string;
  timestamp: string;
  platform: 'whatsapp';
}

export interface WhatsAppThread {
  id: string;
  contactName: string;
  contactRole: 'rider' | 'support' | 'restaurant';
  messages: WhatsAppMessage[];
}

/**
 * Dummy WhatsApp message threads simulating a student who does food delivery.
 * These cover common real-world situations: late deliveries, wrong orders,
 * navigation issues, customer complaints, restaurant delays, etc.
 */
export const dummyWhatsAppThreads: WhatsAppThread[] = [
  {
    id: 'thread-1',
    contactName: 'Rider Support',
    contactRole: 'support',
    messages: [
      { id: 'm1', sender: 'student', senderName: 'You', text: 'Hi, the customer says the order is wrong but I already picked it up from the restaurant. What should I do?', timestamp: '2026-02-25T18:32:00', platform: 'whatsapp' },
      { id: 'm2', sender: 'support', senderName: 'Rider Support', text: 'Hi! Please deliver the order as is. We will contact the customer and arrange a refund or redelivery if needed. You won\'t be penalized.', timestamp: '2026-02-25T18:33:00', platform: 'whatsapp' },
      { id: 'm3', sender: 'student', senderName: 'You', text: 'Ok thanks. Also the address pin is wrong, the customer told me a different location on the phone. Should I go to the new address?', timestamp: '2026-02-25T18:34:00', platform: 'whatsapp' },
      { id: 'm4', sender: 'support', senderName: 'Rider Support', text: 'Yes, please deliver to the correct address the customer gave you. We\'ll update it in the system. Make sure to confirm the new address with the customer before heading there.', timestamp: '2026-02-25T18:35:00', platform: 'whatsapp' },
      { id: 'm5', sender: 'student', senderName: 'You', text: 'Done, delivered. But it took 15 extra minutes because of the address change. Will I get compensated?', timestamp: '2026-02-25T18:52:00', platform: 'whatsapp' },
      { id: 'm6', sender: 'support', senderName: 'Rider Support', text: 'We\'ve added a distance adjustment to your earnings for this delivery. You should see it reflected in your next payout. Thank you for your patience!', timestamp: '2026-02-25T18:54:00', platform: 'whatsapp' },
    ],
  },
  {
    id: 'thread-2',
    contactName: 'Mario\'s Pizza',
    contactRole: 'restaurant',
    messages: [
      { id: 'm7', sender: 'restaurant', senderName: 'Mario\'s Pizza', text: 'Order #4521 is not ready yet, we need 10 more minutes. Sorry for the delay.', timestamp: '2026-02-26T12:15:00', platform: 'whatsapp' },
      { id: 'm8', sender: 'student', senderName: 'You', text: 'Ok I will wait. But last time I waited 20 minutes and nobody told me. Can you please update me if it takes longer?', timestamp: '2026-02-26T12:16:00', platform: 'whatsapp' },
      { id: 'm9', sender: 'restaurant', senderName: 'Mario\'s Pizza', text: 'Of course, we will let you know. The pizza is in the oven now. Should be done in about 8 minutes.', timestamp: '2026-02-26T12:17:00', platform: 'whatsapp' },
      { id: 'm10', sender: 'student', senderName: 'You', text: 'Thanks. Also, is the drink included? The order says 1 large pizza + 1 Coke but I only see the pizza box.', timestamp: '2026-02-26T12:25:00', platform: 'whatsapp' },
      { id: 'm11', sender: 'restaurant', senderName: 'Mario\'s Pizza', text: 'Oh sorry! Yes the Coke is part of the order. Let me grab it for you now. All ready to go!', timestamp: '2026-02-26T12:26:00', platform: 'whatsapp' },
    ],
  },
  {
    id: 'thread-3',
    contactName: 'Angry Customer - Order #4587',
    contactRole: 'rider',
    messages: [
      { id: 'm12', sender: 'rider', senderName: 'Customer', text: 'Where is my food?? It says delivered but I never received it!', timestamp: '2026-02-26T19:45:00', platform: 'whatsapp' },
      { id: 'm13', sender: 'student', senderName: 'You', text: 'Hello, I left it at the door as the delivery instructions said. It should be at your front door.', timestamp: '2026-02-26T19:46:00', platform: 'whatsapp' },
      { id: 'm14', sender: 'rider', senderName: 'Customer', text: 'There is nothing at my door! You left it at the wrong house!', timestamp: '2026-02-26T19:47:00', platform: 'whatsapp' },
      { id: 'm15', sender: 'student', senderName: 'You', text: 'I\'m sorry about that. I went to the address on the app. Can you check with your neighbors? I can also contact support to help resolve this.', timestamp: '2026-02-26T19:48:00', platform: 'whatsapp' },
      { id: 'm16', sender: 'rider', senderName: 'Customer', text: 'Fine. My neighbor had it. But the food is cold now. This is unacceptable.', timestamp: '2026-02-26T19:52:00', platform: 'whatsapp' },
      { id: 'm17', sender: 'student', senderName: 'You', text: 'I understand your frustration and I apologize. Please contact support through the app and they can arrange a refund or credit for you. I\'ll also report the address issue so it doesn\'t happen again.', timestamp: '2026-02-26T19:53:00', platform: 'whatsapp' },
    ],
  },
  {
    id: 'thread-4',
    contactName: 'Fellow Rider - Ahmed',
    contactRole: 'rider',
    messages: [
      { id: 'm18', sender: 'rider', senderName: 'Ahmed', text: 'Hey bro, are you working the dinner shift tonight? Zone 3 is really busy, lots of orders.', timestamp: '2026-02-27T16:30:00', platform: 'whatsapp' },
      { id: 'm19', sender: 'student', senderName: 'You', text: 'Yeah I\'m starting at 5. Thanks for the tip! Is there much traffic in that area?', timestamp: '2026-02-27T16:31:00', platform: 'whatsapp' },
      { id: 'm20', sender: 'rider', senderName: 'Ahmed', text: 'A bit but it\'s manageable. Also heads up, the new sushi place on Oak Street takes forever to prepare orders. Try to avoid if you can lol', timestamp: '2026-02-27T16:32:00', platform: 'whatsapp' },
      { id: 'm21', sender: 'student', senderName: 'You', text: 'Haha good to know. Last night I had a customer who changed their address after I picked up the food. So annoying. Took me 20 extra minutes.', timestamp: '2026-02-27T16:33:00', platform: 'whatsapp' },
      { id: 'm22', sender: 'rider', senderName: 'Ahmed', text: 'That happens all the time. You should contact support when that happens, they give you extra pay for the distance. Don\'t just accept it.', timestamp: '2026-02-27T16:34:00', platform: 'whatsapp' },
      { id: 'm23', sender: 'student', senderName: 'You', text: 'Yeah I did actually. They adjusted my earnings. By the way, did you get the bonus notification for this weekend? 1.5x surge pricing Saturday night.', timestamp: '2026-02-27T16:35:00', platform: 'whatsapp' },
      { id: 'm24', sender: 'rider', senderName: 'Ahmed', text: 'Yes! I\'m definitely working Saturday. We should coordinate zones so we don\'t overlap. I\'ll take Zone 2 if you take Zone 3?', timestamp: '2026-02-27T16:36:00', platform: 'whatsapp' },
    ],
  },
  {
    id: 'thread-5',
    contactName: 'Rider Support',
    contactRole: 'support',
    messages: [
      { id: 'm25', sender: 'student', senderName: 'You', text: 'Hi, I had an accident on my bicycle during a delivery. I\'m okay but my front wheel is damaged. I can\'t continue delivering tonight.', timestamp: '2026-02-27T20:15:00', platform: 'whatsapp' },
      { id: 'm26', sender: 'support', senderName: 'Rider Support', text: 'We\'re sorry to hear that! First, are you sure you\'re okay? Do you need medical assistance?', timestamp: '2026-02-27T20:16:00', platform: 'whatsapp' },
      { id: 'm27', sender: 'student', senderName: 'You', text: 'No I\'m fine, just some scratches. But I have an active order #4601 that I can\'t deliver now. The food is with me.', timestamp: '2026-02-27T20:17:00', platform: 'whatsapp' },
      { id: 'm28', sender: 'support', senderName: 'Rider Support', text: 'We\'ll reassign order #4601 to another rider near your location. Please keep the food safe until the new rider arrives. We\'re marking your status as unavailable. You can file an incident report in the app for insurance purposes.', timestamp: '2026-02-27T20:18:00', platform: 'whatsapp' },
      { id: 'm29', sender: 'student', senderName: 'You', text: 'Ok thank you. Where do I file the incident report? I\'ve never had to do it before.', timestamp: '2026-02-27T20:19:00', platform: 'whatsapp' },
      { id: 'm30', sender: 'support', senderName: 'Rider Support', text: 'Go to Settings > Safety > Report Incident. Upload photos of the damage and describe what happened. Our safety team will review it within 24 hours. Take care!', timestamp: '2026-02-27T20:20:00', platform: 'whatsapp' },
    ],
  },
  {
    id: 'thread-6',
    contactName: 'Spice Garden Restaurant',
    contactRole: 'restaurant',
    messages: [
      { id: 'm31', sender: 'student', senderName: 'You', text: 'Hi, I\'m here for order #4612. The app says it should be ready.', timestamp: '2026-02-28T13:05:00', platform: 'whatsapp' },
      { id: 'm32', sender: 'restaurant', senderName: 'Spice Garden', text: 'Hi rider! We had to remake the order because we ran out of chicken tikka. We substituted with lamb. Is the customer okay with that?', timestamp: '2026-02-28T13:06:00', platform: 'whatsapp' },
      { id: 'm33', sender: 'student', senderName: 'You', text: 'I don\'t know, I can\'t decide for the customer. You should contact them directly through the app or let support know about the substitution.', timestamp: '2026-02-28T13:07:00', platform: 'whatsapp' },
      { id: 'm34', sender: 'restaurant', senderName: 'Spice Garden', text: 'You\'re right, sorry. We\'ll contact them now. Can you wait 5 minutes?', timestamp: '2026-02-28T13:08:00', platform: 'whatsapp' },
      { id: 'm35', sender: 'student', senderName: 'You', text: 'I can wait 5 minutes but not more. I have other deliveries queued up. Please hurry.', timestamp: '2026-02-28T13:09:00', platform: 'whatsapp' },
      { id: 'm36', sender: 'restaurant', senderName: 'Spice Garden', text: 'Customer confirmed lamb is fine! Order is ready now. Thank you for waiting!', timestamp: '2026-02-28T13:12:00', platform: 'whatsapp' },
    ],
  },
];

/**
 * Flattened list of all messages across threads, for easy LLM context.
 */
export function getAllMessages(): WhatsAppMessage[] {
  return dummyWhatsAppThreads.flatMap(thread => thread.messages);
}

/**
 * Format threads into a readable string for LLM context.
 */
export function formatThreadsForLLM(): string {
  return dummyWhatsAppThreads.map(thread => {
    const header = `--- Conversation with ${thread.contactName} (${thread.contactRole}) ---`;
    const messages = thread.messages.map(m =>
      `[${m.timestamp}] ${m.senderName}: ${m.text}`
    ).join('\n');
    return `${header}\n${messages}`;
  }).join('\n\n');
}
