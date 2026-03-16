// Renderer logic for Fly Screen
// Types are declared in global.d.ts

// ============================================
// State
// ============================================

let currentStream: MediaStream | null = null;
let currentDeviceId: string | null = null;

const videoEl = document.getElementById('videoDisplay') as HTMLVideoElement;
const noSignal = document.getElementById('noSignal') as HTMLDivElement;
const floatingBtn = document.getElementById('floatingBtn') as HTMLDivElement;
const contextMenu = document.getElementById('contextMenu') as HTMLDivElement;
const videoSourcesBtn = document.getElementById('videoSourcesBtn') as HTMLDivElement;
const videoSourcesSubmenu = document.getElementById('videoSourcesSubmenu') as HTMLDivElement;
const exitBtn = document.getElementById('exitBtn') as HTMLDivElement;

// ============================================
// Draggable Floating Button
// ============================================

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let btnStartX = 0;
let btnStartY = 0;
let hasDragged = false;

floatingBtn.addEventListener('mousedown', (e: MouseEvent) => {
  // Only allow left-click drag
  if (e.button !== 0) return;

  isDragging = true;
  hasDragged = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;

  const rect = floatingBtn.getBoundingClientRect();
  btnStartX = rect.left;
  btnStartY = rect.top;

  floatingBtn.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e: MouseEvent) => {
  if (!isDragging) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  // Consider it a drag after 5px of movement
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
    hasDragged = true;
  }

  let newX = btnStartX + dx;
  let newY = btnStartY + dy;

  // Clamp to viewport
  const btnW = floatingBtn.offsetWidth;
  const btnH = floatingBtn.offsetHeight;
  newX = Math.max(0, Math.min(window.innerWidth - btnW, newX));
  newY = Math.max(0, Math.min(window.innerHeight - btnH, newY));

  floatingBtn.style.left = `${newX}px`;
  floatingBtn.style.top = `${newY}px`;
  floatingBtn.style.right = 'auto';
  floatingBtn.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  floatingBtn.classList.remove('dragging');
});

// ============================================
// Context Menu
// ============================================

floatingBtn.addEventListener('click', (e: MouseEvent) => {
  // Don't open menu if user was dragging
  if (hasDragged) return;

  e.stopPropagation();
  toggleContextMenu();
});

function toggleContextMenu(): void {
  const isHidden = contextMenu.classList.contains('hidden');
  if (isHidden) {
    showContextMenu();
  } else {
    hideContextMenu();
  }
}

function showContextMenu(): void {
  // Position the menu near the floating button
  const btnRect = floatingBtn.getBoundingClientRect();
  const menuWidth = 220;
  const menuHeight = 160; // approximate

  let menuX = btnRect.left - menuWidth - 12;
  let menuY = btnRect.top - menuHeight + btnRect.height;

  // If menu goes off the left edge, show on the right side
  if (menuX < 8) {
    menuX = btnRect.right + 12;
  }

  // If menu goes off the top, push down
  if (menuY < 8) {
    menuY = 8;
  }

  // If menu goes off the bottom, push up
  if (menuY + menuHeight > window.innerHeight - 8) {
    menuY = window.innerHeight - menuHeight - 8;
  }

  contextMenu.style.left = `${menuX}px`;
  contextMenu.style.top = `${menuY}px`;
  contextMenu.classList.remove('hidden');
  floatingBtn.classList.add('menu-open');

  // Hide submenu when opening
  videoSourcesSubmenu.classList.add('hidden');
}

function hideContextMenu(): void {
  contextMenu.classList.add('hidden');
  videoSourcesSubmenu.classList.add('hidden');
  floatingBtn.classList.remove('menu-open');
}

// Close menu when clicking outside
document.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!contextMenu.contains(target) && !floatingBtn.contains(target)) {
    hideContextMenu();
  }
});

// ============================================
// Video Sources Submenu
// ============================================

videoSourcesBtn.addEventListener('click', async (e: MouseEvent) => {
  e.stopPropagation();
  await populateVideoSources();
  videoSourcesSubmenu.classList.toggle('hidden');
});

// Keep submenu visible when hovering over the Video Sources item
videoSourcesBtn.addEventListener('mouseenter', async () => {
  await populateVideoSources();
  videoSourcesSubmenu.classList.remove('hidden');
});

async function populateVideoSources(): Promise<void> {
  videoSourcesSubmenu.innerHTML = '<div class="menu-item submenu-loading">Scanning devices...</div>';

  try {
    // Request permission first (needed to get device labels)
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach((t) => t.stop());
    } catch {
      // Permission denied or no devices, we'll handle below
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');

    if (videoDevices.length === 0) {
      videoSourcesSubmenu.innerHTML = '<div class="menu-item submenu-empty">No video devices found</div>';
      return;
    }

    videoSourcesSubmenu.innerHTML = '';
    videoDevices.forEach((device, index) => {
      const item = document.createElement('div');
      item.className = 'menu-item';
      if (device.deviceId === currentDeviceId) {
        item.classList.add('active-source');
      }
      item.textContent = device.label || `Camera ${index + 1}`;
      item.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        selectVideoSource(device.deviceId, device.label || `Camera ${index + 1}`);
        hideContextMenu();
      });
      videoSourcesSubmenu.appendChild(item);
    });
  } catch (err) {
    videoSourcesSubmenu.innerHTML = '<div class="menu-item submenu-empty">Error scanning devices</div>';
    console.error('Failed to enumerate devices:', err);
  }
}

// ============================================
// Video Source Selection
// ============================================

async function selectVideoSource(deviceId: string, label: string): Promise<void> {
  // Stop current stream
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    currentStream = stream;
    currentDeviceId = deviceId;
    videoEl.srcObject = stream;
    noSignal.classList.add('hidden');

    console.log(`Video source selected: ${label}`);
  } catch (err) {
    console.error(`Failed to start video from "${label}":`, err);
    noSignal.classList.remove('hidden');
  }
}

// ============================================
// Exit
// ============================================

exitBtn.addEventListener('click', (e: MouseEvent) => {
  e.stopPropagation();
  window.flyScreen.exitApp();
});

// ============================================
// Keyboard shortcut: Escape to close menu
// ============================================

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (!contextMenu.classList.contains('hidden')) {
      hideContextMenu();
    }
  }
});

// ============================================
// Init
// ============================================

(async () => {
  console.log('Fly Screen v1.0 initialized');
})();
