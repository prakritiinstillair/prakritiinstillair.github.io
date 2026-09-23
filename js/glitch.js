document.addEventListener('DOMContentLoaded', () => {
  // 1. JS側でSVGフィルターを動的に生成して <body> に注入
  function injectSVGFilters() {
    // 既に作成されている場合は二重挿入しない
    if (document.getElementById('glitch-svg-container')) return;

    const svgContainer = document.createElement('div');
    svgContainer.id = 'glitch-svg-container';
    svgContainer.style.display = 'none';

    svgContainer.innerHTML = `
      <svg style="display: none;">
        <defs>
          <!-- TYPE 1: 砂嵐ノイズフィルター -->
          <filter id="glitch-noise" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08 0.08" numOctaves="1" result="noise" id="turb-noise" />
            <feComponentTransfer in="noise" result="quantized">
              <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1" />
              <feFuncG type="discrete" tableValues="0 0.5 1" />
              <feFuncB type="discrete" tableValues="0 0.33 0.66 1" />
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="quantized" mode="overlay" result="blended" />
            <feDisplacementMap in="blended" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" id="disp-noise" />
          </filter>

          <!-- TYPE 2: feTile 反復格子フィルター -->
          <filter id="glitch-tile" x="-20%" y="-20%" width="140%" height="140%">
            <feTile in="SourceGraphic" result="tiled-pattern" />
            <feTurbulence type="turbulence" baseFrequency="0.05 0.05" numOctaves="1" result="map-raw" id="turb-tile" />
            <feComponentTransfer in="map-raw" result="map-quantized">
              <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
              <feFuncG type="discrete" tableValues="0 0.5 1" />
            </feComponentTransfer>
            <feDisplacementMap in="tiled-pattern" in2="map-quantized" scale="30" xChannelSelector="R" yChannelSelector="G" result="displaced-tile" id="disp-tile" />
            <feBlend in="SourceGraphic" in2="displaced-tile" mode="exclusion" result="xor-result" />
            <feDisplacementMap in="xor-result" in2="map-quantized" scale="15" xChannelSelector="G" yChannelSelector="R" />
          </filter>
        </defs>
      </svg>
    `;

    document.body.appendChild(svgContainer);
  }

  // SVG注入を実行
  injectSVGFilters();

  // 2. 関連要素とアニメーション処理の初期化
  const targets = document.querySelectorAll('.glitch-target');
  
  const turbNoise = document.getElementById('turb-noise');
  const dispNoise = document.getElementById('disp-noise');
  const turbTile = document.getElementById('turb-tile');
  const dispTile = document.getElementById('disp-tile');

  // 安全策：要素がなければ処理終了
  if (!turbNoise || !turbTile) return;

  let mouseX = 0;
  let mouseY = 0;
  let nextSwitchTime = 0;
  let currentMode = 'none';

  const quietMin = 600;
  const quietMax = 2500;
  const glitchMin = 80;
  const glitchMax = 320;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function getRandomDuration(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function update(currentTime) {
    requestAnimationFrame(update);

    if (currentTime >= nextSwitchTime) {
      if (currentMode !== 'none') {
        currentMode = 'none';
        nextSwitchTime = currentTime + getRandomDuration(quietMin, quietMax);
      } else {
        currentMode = Math.random() < 0.5 ? 'noise' : 'tile';
        nextSwitchTime = currentTime + getRandomDuration(glitchMin, glitchMax);

        const seed = Math.floor(Math.random() * 100);
        turbNoise.setAttribute('seed', seed);
        turbTile.setAttribute('seed', seed);
      }
    }

    // 全ての .glitch-target にフィルター状態を適用
    targets.forEach(target => {
      if (currentMode === 'none') {
        target.style.filter = 'none';
      } else if (currentMode === 'noise') {
        target.style.filter = 'url(#glitch-noise)';
      } else if (currentMode === 'tile') {
        target.style.filter = 'url(#glitch-tile)';
      }
    });

    // パラメータの更新
    if (currentMode === 'noise') {
      const rawFreqX = 0.01 + (mouseX * 0.2) + (Math.random() * 0.04);
      const rawFreqY = 0.01 + (mouseY * 0.2) + (Math.random() * 0.04);
      turbNoise.setAttribute('baseFrequency', `${Math.floor(rawFreqX * 50) / 50} ${Math.floor(rawFreqY * 50) / 50}`);
      dispNoise.setAttribute('scale', 15 + Math.pow(Math.random(), 2) * (60 + mouseY * 60));
    } else if (currentMode === 'tile') {
      const fx = Math.floor((0.02 + mouseX * 0.1) * 20) / 20;
      const fy = Math.floor((0.02 + mouseY * 0.1) * 20) / 20;
      turbTile.setAttribute('baseFrequency', `${fx} ${fy}`);
      dispTile.setAttribute('scale', 20 + mouseX * 45 + (Math.random() * 40));
    }
  }

  nextSwitchTime = performance.now() + getRandomDuration(quietMin, quietMax);
  requestAnimationFrame(update);
});
