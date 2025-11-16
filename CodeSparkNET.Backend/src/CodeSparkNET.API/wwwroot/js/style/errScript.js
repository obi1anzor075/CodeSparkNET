function reload() {
  location.reload();
}

function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
    particlesContainer.appendChild(particle);
  }
}

function createEmojiRain() {
  const emojis = ['💻', '⚡', '🔧', '🤖', '💾', '🎮', '⚙️', '🌟'];
  const container = document.body;

  setInterval(() => {
    const emoji = document.createElement('div');
    emoji.className = 'emoji-rain';
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.left = Math.random() * 100 + '%';
    emoji.style.animationDuration = (Math.random() * 2 + 3) + 's';
    container.appendChild(emoji);

    setTimeout(() => {
      emoji.remove();
    }, 5000);
  }, 800);
}

document.addEventListener('DOMContentLoaded', function () {
  createParticles();
  createEmojiRain();
});