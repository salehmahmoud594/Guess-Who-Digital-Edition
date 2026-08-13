export const EMOJI_ASSETS = [
  ["Grinning Face", "😀"], ["Beaming Face", "😁"], ["Face With Tears", "😂"], ["Smiling Face", "😊"],
  ["Winking Face", "😉"], ["Heart Eyes", "😍"], ["Sunglasses Face", "😎"], ["Cowboy Hat Face", "🤠"],
  ["Party Face", "🥳"], ["Thinking Face", "🤔"], ["Shushing Face", "🤫"], ["Zipper Mouth Face", "🤐"],
  ["Sleeping Face", "😴"], ["Exploding Head", "🤯"], ["Angry Face", "😠"], ["Crying Face", "😢"],
  ["Fearful Face", "😨"], ["Ghost", "👻"], ["Alien", "👽"], ["Robot", "🤖"],
  ["Clown Face", "🤡"], ["Skull", "💀"], ["Pumpkin", "🎃"], ["Devil", "😈"],
  ["Monkey", "🐵"], ["Cat Face", "🐱"], ["Dog Face", "🐶"], ["Fox Face", "🦊"],
  ["Lion Face", "🦁"], ["Panda Face", "🐼"], ["Unicorn", "🦄"], ["Dragon", "🐲"],
  ["Sun", "☀️"], ["Moon", "🌙"], ["Rainbow", "🌈"], ["Lightning", "⚡"],
  ["Fire", "🔥"], ["Red Heart", "❤️"], ["Star", "⭐"], ["Soccer Ball", "⚽"],
  ["Pizza", "🍕"], ["Ice Cream", "🍦"], ["Birthday Cake", "🎂"], ["Coffee", "☕"],
  ["Rocket", "🚀"], ["Red Car", "🚗"], ["Camera", "📷"], ["Guitar", "🎸"],
] as const;

export const EMOJI_NAMES = EMOJI_ASSETS.map(([name]) => name);
export const EMOJI_BY_NAME: Record<string, string> = Object.fromEntries(EMOJI_ASSETS);
