/**
 * ==========================================================================
 * ROBOT COCINERO • LÓGICA E INTERACTIVIDAD (JAVASCRIPT)
 * TP Integrador de Tecnología de la Información
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
   * 1. SIMULADOR VIRTUAL BBC MICRO:BIT
   * -------------------------------------------------------------------------- */
  const ledMatrixContainer = document.getElementById('sim-led-matrix');
  const chefHatLed = document.getElementById('sim-chef-led');
  const simStatusMsg = document.getElementById('sim-status-msg');
  const btnA = document.getElementById('sim-btn-a');
  const btnB = document.getElementById('sim-btn-b');
  const actionBtnA = document.getElementById('action-btn-a');
  const actionBtnB = document.getElementById('action-btn-b');
  const actionBtnAB = document.getElementById('action-btn-ab');
  const actionBtnSound = document.getElementById('action-btn-sound');
  const lightSlider = document.getElementById('sim-light-slider');
  const lightValDisplay = document.getElementById('light-val-display');

  // Inicializar Matriz 5x5 de LEDs
  const leds = [];
  if (ledMatrixContainer) {
    ledMatrixContainer.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const led = document.createElement('div');
      led.classList.add('sim-led');
      led.dataset.index = i;
      ledMatrixContainer.appendChild(led);
      leds.push(led);
    }
  }

  // Patrones de Matriz 5x5 (1 = Encendido, 0 = Apagado)
  const ICONS = {
    HAPPY: [
      0, 1, 0, 1, 0,
      0, 1, 0, 1, 0,
      0, 0, 0, 0, 0,
      1, 0, 0, 0, 1,
      0, 1, 1, 1, 0
    ],
    HEART: [
      0, 1, 0, 1, 0,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      0, 1, 1, 1, 0,
      0, 0, 1, 0, 0
    ],
    CHEF: [
      1, 1, 1, 1, 1,
      0, 1, 0, 1, 0,
      0, 0, 1, 0, 0,
      1, 1, 0, 1, 1,
      0, 1, 1, 1, 0
    ],
    APPLE: [
      0, 0, 1, 1, 0,
      0, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      0, 1, 0, 1, 0
    ],
    THREE: [
      1, 1, 1, 1, 0,
      0, 0, 0, 0, 1,
      0, 1, 1, 1, 0,
      0, 0, 0, 0, 1,
      1, 1, 1, 1, 0
    ],
    TWO: [
      0, 1, 1, 1, 0,
      1, 0, 0, 0, 1,
      0, 0, 1, 1, 0,
      0, 1, 0, 0, 0,
      1, 1, 1, 1, 1
    ],
    ONE: [
      0, 0, 1, 0, 0,
      0, 1, 1, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
      0, 1, 1, 1, 0
    ],
    YES: [
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
      0, 0, 0, 1, 0,
      1, 0, 1, 0, 0,
      0, 1, 0, 0, 0
    ],
    MOON: [
      0, 0, 1, 1, 0,
      0, 1, 1, 0, 0,
      0, 1, 1, 0, 0,
      0, 1, 1, 0, 0,
      0, 0, 1, 1, 0
    ],
    BLANK: new Array(25).fill(0)
  };

  function renderPattern(pattern) {
    if (!leds || leds.length !== 25) return;
    for (let i = 0; i < 25; i++) {
      if (pattern[i] === 1) {
        leds[i].classList.add('on');
      } else {
        leds[i].classList.remove('on');
      }
    }
  }

  // Generador de audio Web Audio API para simular el Buzzer del micro:bit
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio contextualizado no permitido o deshabilitado');
    }
  }

  function playMelodyBaDing() {
    playTone(523.25, 'triangle', 0.12); // C5
    setTimeout(() => playTone(659.25, 'triangle', 0.12), 120); // E5
    setTimeout(() => playTone(783.99, 'triangle', 0.25), 240); // G5
  }

  function playFanfare() {
    playTone(523.25, 'triangle', 0.1);
    setTimeout(() => playTone(523.25, 'triangle', 0.1), 110);
    setTimeout(() => playTone(523.25, 'triangle', 0.1), 220);
    setTimeout(() => playTone(659.25, 'triangle', 0.35), 330);
  }

  // Animación inicial del simulador
  renderPattern(ICONS.HAPPY);
  if (chefHatLed) chefHatLed.classList.add('active');

  // Interacción Botón A: Registro de comida sana
  function triggerButtonA() {
    if (btnA) {
      btnA.classList.add('pressed');
      setTimeout(() => btnA.classList.remove('pressed'), 250);
    }
    simStatusMsg.textContent = '🍎 Botón A: ¡Comida sana registrada! +1 Punto Nutricional';
    playMelodyBaDing();
    renderPattern(ICONS.APPLE);

    setTimeout(() => {
      renderPattern(ICONS.HAPPY);
      simStatusMsg.textContent = 'Robot: ¡Excelente elección nutritiva!';
    }, 1300);
  }

  // Interacción Botón B: Temporizador de masticación
  let isTimerRunning = false;
  function triggerButtonB() {
    if (isTimerRunning) return;
    isTimerRunning = true;

    if (btnB) {
      btnB.classList.add('pressed');
      setTimeout(() => btnB.classList.remove('pressed'), 250);
    }

    simStatusMsg.textContent = '⏱️ Botón B: Mastica con calma y disfruta... (3)';
    renderPattern(ICONS.THREE);
    playTone(440, 'sine', 0.15);

    setTimeout(() => {
      renderPattern(ICONS.TWO);
      playTone(440, 'sine', 0.15);
      simStatusMsg.textContent = '⏱️ Mastica con calma... (2)';
    }, 1000);

    setTimeout(() => {
      renderPattern(ICONS.ONE);
      playTone(440, 'sine', 0.15);
      simStatusMsg.textContent = '⏱️ Respira y saborea... (1)';
    }, 2000);

    setTimeout(() => {
      renderPattern(ICONS.YES);
      playTone(880, 'sine', 0.3);
      simStatusMsg.textContent = '🎉 ¡Excelente! Bocado completado a buen ritmo.';
      setTimeout(() => {
        renderPattern(ICONS.HAPPY);
        isTimerRunning = false;
      }, 1500);
    }, 3000);
  }

  // Interacción Botón A + B: Celebración "¡A COMER!"
  function triggerButtonAB() {
    if (btnA) btnA.classList.add('pressed');
    if (btnB) btnB.classList.add('pressed');
    setTimeout(() => {
      if (btnA) btnA.classList.remove('pressed');
      if (btnB) btnB.classList.remove('pressed');
    }, 300);

    simStatusMsg.textContent = '🎉 ¡A + B: ¡A COMER! El Robot Cocinero celebra el almuerzo!';
    playFanfare();

    renderPattern(ICONS.CHEF);
    if (chefHatLed) {
      chefHatLed.classList.add('active');
    }

    setTimeout(() => renderPattern(ICONS.HEART), 800);
    setTimeout(() => renderPattern(ICONS.CHEF), 1600);
    setTimeout(() => renderPattern(ICONS.HAPPY), 2400);
  }

  // Event Listeners del Simulador
  if (btnA) btnA.addEventListener('click', triggerButtonA);
  if (btnB) btnB.addEventListener('click', triggerButtonB);
  if (actionBtnA) actionBtnA.addEventListener('click', triggerButtonA);
  if (actionBtnB) actionBtnB.addEventListener('click', triggerButtonB);
  if (actionBtnAB) actionBtnAB.addEventListener('click', triggerButtonAB);
  if (actionBtnSound) {
    actionBtnSound.addEventListener('click', () => {
      playMelodyBaDing();
      simStatusMsg.textContent = '🔔 Buzzer acústico: Tono Ba-Ding reproducido';
    });
  }

  // Slider de Luz Ambiental
  if (lightSlider && lightValDisplay) {
    lightSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (val <= 30) {
        lightValDisplay.textContent = `${val}% (Noche / Luz Baja)`;
        if (chefHatLed) chefHatLed.classList.add('active');
        simStatusMsg.textContent = '🌙 Sensor de Luz < 30%: Activando LED de chef para la cena';
        renderPattern(ICONS.MOON);
      } else {
        lightValDisplay.textContent = `${val}% (Día)`;
        renderPattern(ICONS.HAPPY);
        simStatusMsg.textContent = `☀️ Sensor de Luz ${val}%: Ambiente iluminado`;
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 2. PRESETS INTERACTIVOS DE PROBLEMÁTICA
   * -------------------------------------------------------------------------- */
  const PRESETS = {
    nutricion: {
      title: "Malnutrición y Obesidad Infantil",
      description: `<p>En la actualidad, la <strong>malnutrición y la obesidad infantil</strong> constituyen una de las problemáticas de salud más críticas y extendidas en la población escolar. Una alarmante proporción de niños y niñas no logran incorporar a su rutina diaria porciones suficientes de frutas, verduras y nutrientes esenciales, conviviendo con la paradoja de la malnutrición: carencias graves de micronutrientes (vitaminas, minerales y fibra) combinada con un exceso calórico perjudicial originado por alimentos de bajo valor nutricional.</p>
      <p>Este desequilibrio no solo se manifiesta en el sobrepeso corporal, sino también en fatiga crónica escolar, dificultades de atención y memoria en el aula, desórdenes digestivos y una predisposición prematura a enfermedades metabólicas y cardiovasculares.</p>
      <p><strong>Nuestra meta como equipo de Tecnología de la Información:</strong> Abordar esta problemática mediante la robótica educativa con BBC micro:bit, creando un asistente empático e interactivo que transforme la adopción de hábitos nutricionales y el consumo de alimentos saludables en una experiencia lúdica, visual y positiva.</p>`,
      ctaTitle: "¿Por qué es urgente actuar ante la malnutrición infantil?",
      ctaDesc: "Los patrones alimentarios establecidos en la infancia determinan la salud durante toda la vida adulta. Si comer sano se percibe como una imposición o castigo, el rechazo perdura. Por eso convertimos el momento de nutrirse en un juego donde el Robot Cocinero es un compañero motivador que celebra cada elección saludable."
    },
    ultraprocesados: {
      title: "El Consumo Excesivo de Azúcares y Alimentos Ultraprocesados en la Infancia",
      description: `<p>El acceso continuo a productos empaquetados con alto contenido de sodio, grasas saturadas y jarabe de maíz de alta fructosa ha normalizado su consumo cotidiano en los recreos y meriendas escolares.</p>
      <p>Este patrón desplaza las colaciones frescas, alterando el paladar infantil y reduciendo la tolerancia a sabores naturales como el de los vegetales crudos y frutas frescas.</p>
      <p><strong>Nuestra propuesta:</strong> El Robot Cocinero actúa como un semáforo nutricional interactivo en el hogar y en la escuela, incentivando el reemplazo de golosinas por manzanas, frutos secos y ensaladas coloridas.</p>`,
      ctaTitle: "Sensibilización Escolar sobre Etiquetado y Azúcares",
      ctaDesc: "Enseñar a los niños a identificar qué alimentos nutren su cuerpo y cuáles solo aportan calorías vacías es el primer paso para formar ciudadanos sanos y conscientes."
    },
    pantallas: {
      title: "Distracción Digital y Pérdida de Rutinas Saludables al Comer",
      description: `<p>El hábito recurrente de comer mirando teléfonos móviles, tabletas o televisores desconecta al niño de sus señales biológicas de saciedad y hambre real.</p>
      <p>Como consecuencia, se come de forma automática, masticando menos veces y consumiendo hasta un 30% más de comida chatarra de manera involuntaria.</p>
      <p><strong>El rol del Robot Cocinero:</strong> Convierte la mesa en un espacio libre de pantallas móviles. La interacción se centra en el robot, sus tiempos de masticación guiados y el disfrute consciente de los alimentos.</p>`,
      ctaTitle: "Recuperar el Momento Sagrado de Compartir la Mesa",
      ctaDesc: "Comer despacio y en familia no solo favorece una absorción óptima de nutrientes, sino que fortalece la comunicación y la salud emocional de los niños."
    },
    personalizada: {
      title: "Problemática Personalizada del Equipo: (Escribe aquí el título)",
      description: `<p>Haz clic en este espacio o activa el botón 'Modo Edición' en la barra superior para redactar la problemática exacta que investigó tu grupo.</p>
      <p>Puedes detallar el contexto escolar o barrial, las entrevistas que hicieron, el problema detectado y por qué decidieron abordarlo con el Robot Cocinero.</p>`,
      ctaTitle: "Justificación de Nuestro Proyecto",
      ctaDesc: "Redacta brevemente por qué tu equipo considera que el prototipo robótico con BBC micro:bit es la mejor respuesta para transformar esta situación."
    }
  };

  const presetButtons = document.querySelectorAll('.preset-btn');
  const problemTitle = document.getElementById('problem-title');
  const problemDesc = document.getElementById('problem-description');
  const problemCtaTitle = document.getElementById('problem-cta-title');
  const problemCtaDesc = document.getElementById('problem-cta-desc');
  const inputProblemTopic = document.getElementById('input-problem-topic');
  const inputProblemDetail = document.getElementById('input-problem-detail');

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.dataset.preset;
      const data = PRESETS[presetKey];
      if (data) {
        if (problemTitle) problemTitle.innerHTML = data.title;
        if (problemDesc) problemDesc.innerHTML = data.description;
        if (problemCtaTitle) problemCtaTitle.innerHTML = data.ctaTitle;
        if (problemCtaDesc) problemCtaDesc.innerHTML = data.ctaDesc;

        // Actualizar formulario del equipo si existe
        if (inputProblemTopic) inputProblemTopic.value = data.title.replace(/<[^>]*>/g, '');
        if (inputProblemDetail) inputProblemDetail.value = data.description.replace(/<[^>]*>/g, '').trim();

        // Feedback sonoro suave
        playTone(600, 'sine', 0.08);
      }
    });
  });

  /* --------------------------------------------------------------------------
   * 3. MODO EDICIÓN EN VIVO Y PERSISTENCIA (LOCALSTORAGE)
   * -------------------------------------------------------------------------- */
  const toggleEditBtn = document.getElementById('toggle-edit-mode-btn');
  const editBanner = document.getElementById('edit-mode-banner');
  const editableFields = document.querySelectorAll('.editable-field');
  const saveContentBtn = document.getElementById('save-content-btn');
  const resetDefaultBtn = document.getElementById('reset-default-btn');

  let isEditMode = false;

  function setEditMode(active) {
    isEditMode = active;
    document.body.classList.toggle('edit-mode-active', active);
    if (editBanner) editBanner.classList.toggle('hidden', !active);

    editableFields.forEach(el => {
      el.contentEditable = active ? 'true' : 'false';
    });

    if (toggleEditBtn) {
      const label = toggleEditBtn.querySelector('.edit-label');
      if (label) {
        label.textContent = active ? 'Finalizar Edición' : 'Modo Edición';
      }
      toggleEditBtn.classList.toggle('btn-primary', active);
      toggleEditBtn.classList.toggle('btn-secondary', !active);
    }
  }

  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      setEditMode(!isEditMode);
    });
  }

  // Guardar en localStorage
  function saveToLocalStorage() {
    const savedData = {};
    editableFields.forEach(el => {
      const key = el.dataset.key;
      if (key) {
        savedData[key] = el.innerHTML;
      }
    });
    localStorage.setItem('robot_cocinero_data', JSON.stringify(savedData));
  }

  // Cargar desde localStorage
  function loadFromLocalStorage() {
    const raw = localStorage.getItem('robot_cocinero_data');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        editableFields.forEach(el => {
          const key = el.dataset.key;
          if (key && data[key]) {
            el.innerHTML = data[key];
          }
        });
      } catch (e) {
        console.error('Error al cargar datos guardados:', e);
      }
    }
  }

  loadFromLocalStorage();

  if (saveContentBtn) {
    saveContentBtn.addEventListener('click', () => {
      saveToLocalStorage();
      playTone(880, 'sine', 0.1);
      alert('✅ ¡Cambios guardados con éxito en tu navegador!');
      setEditMode(false);
    });
  }

  if (resetDefaultBtn) {
    resetDefaultBtn.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar los textos de ejemplo originales del proyecto?')) {
        localStorage.removeItem('robot_cocinero_data');
        window.location.reload();
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 4. FORMULARIO DEL EQUIPO & DESCARGA DE INFORME
   * -------------------------------------------------------------------------- */
  const btnApplyToPage = document.getElementById('btn-apply-to-page');
  const btnSaveDraft = document.getElementById('btn-save-draft');
  const btnDownloadTxt = document.getElementById('btn-download-json');
  const btnPrintView = document.getElementById('btn-print-view');
  const printReportBtn = document.getElementById('print-report-btn');

  if (btnApplyToPage) {
    btnApplyToPage.addEventListener('click', () => {
      const problemTopic = document.getElementById('input-problem-topic').value;
      const problemDetail = document.getElementById('input-problem-detail').value;
      const robotDetail = document.getElementById('input-robot-detail').value;

      if (problemTitle && problemTopic) problemTitle.textContent = problemTopic;
      if (problemDesc && problemDetail) problemDesc.innerHTML = `<p>${problemDetail.replace(/\n/g, '</p><p>')}</p>`;

      const solutionDesc = document.getElementById('solution-description');
      if (solutionDesc && robotDetail) solutionDesc.innerHTML = `<p>${robotDetail.replace(/\n/g, '</p><p>')}</p>`;

      saveToLocalStorage();
      playMelodyBaDing();
      alert('✨ Los textos han sido aplicados con éxito a las secciones correspondientes de la página.');
    });
  }

  if (btnSaveDraft) {
    btnSaveDraft.addEventListener('click', () => {
      saveToLocalStorage();
      alert('💾 Borrador guardado exitosamente.');
    });
  }

  if (btnDownloadTxt) {
    btnDownloadTxt.addEventListener('click', () => {
      const team = document.getElementById('input-team-names').value;
      const subject = document.getElementById('input-subject-name').value;
      const problemTopic = document.getElementById('input-problem-topic').value;
      const problemDetail = document.getElementById('input-problem-detail').value;
      const robotDetail = document.getElementById('input-robot-detail').value;
      const conclusions = document.getElementById('input-conclusions').value;

      const reportContent = `================================================================================
INFORME PROYECTO INTEGRADOR: ROBOT COCINERO (MICRO:BIT)
Materia: ${subject}
Integrantes: ${team}
Fecha: ${new Date().toLocaleDateString('es-ES')}
================================================================================

1. PROBLEMÁTICA DETECTADA:
Título: ${problemTopic}
Descripción:
${problemDetail}

--------------------------------------------------------------------------------
2. NUESTRA SOLUCIÓN: ROBOT COCINERO V2.0
Descripción y Caso de Uso:
${robotDetail}

--------------------------------------------------------------------------------
3. ARQUITECTURA TECNOLÓGICA (HARDWARE Y SOFTWARE)
- Placa Controladora: BBC micro:bit V2
- Pantalla: Matriz de 5x5 LEDs Rojos con animaciones emocionales
- Entradas: Botón A (Alimento Sano), Botón B (Masticación guiada), Sensor de Luz
- Salidas: LED rojo externo en gorro de chef, Buzzer acústico piezoeléctrico
- Entorno de Desarrollo: Microsoft MakeCode y MicroPython
- Materiales Físicos: Estructura de madera ecológica con cubiertos articulados

--------------------------------------------------------------------------------
4. CONCLUSIONES Y APRENDIZAJES:
${conclusions}
================================================================================`;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TP_Integrador_Robot_Cocinero_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function triggerPrint() {
    window.print();
  }

  if (btnPrintView) btnPrintView.addEventListener('click', triggerPrint);
  if (printReportBtn) printReportBtn.addEventListener('click', triggerPrint);

  /* --------------------------------------------------------------------------
   * 5. VISOR DE CÓDIGO (TABS & COPIAR)
   * -------------------------------------------------------------------------- */
  const codeTabs = document.querySelectorAll('.code-tab-btn');
  const codePanes = document.querySelectorAll('.code-tab-pane');
  const copyCodeBtn = document.getElementById('copy-code-btn');

  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => t.classList.remove('active'));
      codePanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(`tab-${tab.dataset.tab}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const activePane = document.querySelector('.code-tab-pane.active');
      if (activePane) {
        const textToCopy = activePane.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = copyCodeBtn.textContent;
          copyCodeBtn.textContent = '✅ ¡Copiado!';
          setTimeout(() => {
            copyCodeBtn.textContent = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Error al copiar:', err);
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 6. CAMBIO DE TEMA CLARO / OSCURO
   * -------------------------------------------------------------------------- */
  const toggleThemeBtn = document.getElementById('toggle-theme-btn');
  const currentTheme = localStorage.getItem('site_theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('site_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (toggleThemeBtn) {
      const icon = toggleThemeBtn.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }
  }

  /* --------------------------------------------------------------------------
   * 7. MENÚ RESPONSIVE Y NAVEGACIÓN ACTIVA
   * -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  // Active scrollspy en navbar
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
   * 8. FILTROS DE SENSORES Y ACTUADORES & COMPARADOR DE FOTO DE CIRCUITO
   * -------------------------------------------------------------------------- */
  const sensorFilterBtns = document.querySelectorAll('.sensor-filter-btn');
  const sensorBlocks = document.querySelectorAll('.sensor-group-block');
  const brainCard = document.querySelector('.brain-card');

  sensorFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sensorFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter; // 'all', 'sensor', 'actuator'

      sensorBlocks.forEach(block => {
        const cat = block.dataset.category;
        if (filter === 'all' || filter === cat) {
          block.classList.remove('hidden-category');
        } else {
          block.classList.add('hidden-category');
        }
      });

      if (brainCard) {
        brainCard.style.display = 'flex';
      }

      playTone(700, 'sine', 0.08);
    });
  });

  // Botón para alternar foto mejorada vs foto original
  const toggleCircuitBtn = document.getElementById('toggle-circuit-photo-btn');
  const circuitMainPhoto = document.getElementById('circuit-main-photo');
  const circuitPill = document.querySelector('.circuit-pill');

  let isShowingOriginal = false;
  if (toggleCircuitBtn && circuitMainPhoto) {
    toggleCircuitBtn.addEventListener('click', () => {
      isShowingOriginal = !isShowingOriginal;
      if (isShowingOriginal) {
        circuitMainPhoto.style.opacity = '0';
        setTimeout(() => {
          circuitMainPhoto.src = 'circuito_original.jpg';
          circuitMainPhoto.style.opacity = '1';
        }, 150);
        toggleCircuitBtn.textContent = '✨ Ver Foto Mejorada HD';
        if (circuitPill) circuitPill.textContent = '📷 Foto Original del Ensayo';
      } else {
        circuitMainPhoto.style.opacity = '0';
        setTimeout(() => {
          circuitMainPhoto.src = 'circuito_sensores_actuadores.jpg';
          circuitMainPhoto.style.opacity = '1';
        }, 150);
        toggleCircuitBtn.textContent = '🔄 Ver Foto Original';
        if (circuitPill) circuitPill.textContent = '✨ Ensayo de Sensores y Actuadores';
      }
      playTone(550, 'triangle', 0.1);
    });
  }

  // Botón para alternar foto de código mejorada vs borrador original
  const toggleCodeBtn = document.getElementById('toggle-code-photo-btn');
  const makecodeCodeImg = document.getElementById('makecode-code-img');

  let isShowingOriginalCode = false;
  if (toggleCodeBtn && makecodeCodeImg) {
    toggleCodeBtn.addEventListener('click', () => {
      isShowingOriginalCode = !isShowingOriginalCode;
      if (isShowingOriginalCode) {
        makecodeCodeImg.style.opacity = '0';
        setTimeout(() => {
          makecodeCodeImg.src = 'codigo_original.png';
          makecodeCodeImg.style.opacity = '1';
        }, 150);
        toggleCodeBtn.textContent = '✨ Ver Código Oficial HD';
      } else {
        makecodeCodeImg.style.opacity = '0';
        setTimeout(() => {
          makecodeCodeImg.src = 'code_blocks.jpg';
          makecodeCodeImg.style.opacity = '1';
        }, 150);
        toggleCodeBtn.textContent = '🔄 Ver Borrador Original';
      }
      playTone(600, 'triangle', 0.1);
    });
  }

  // Hotspots interactivos: al hacer clic resaltan la tarjeta correspondiente
  const hotspotMappings = [
    { selector: '.hotspot-actuator-led', targetId: 'sensor-external-led' },
    { selector: '.hotspot-actuator-matrix', targetId: 'sensor-matrix' },
    { selector: '.hotspot-sensor-buttons', targetId: 'sensor-buttons' },
    { selector: '.hotspot-shield', targetId: 'sensor-microbit' }
  ];

  hotspotMappings.forEach(mapping => {
    const el = document.querySelector(mapping.selector);
    const target = document.getElementById(mapping.targetId);
    if (el && target) {
      el.addEventListener('click', () => {
        const card = target.closest('.sensor-card');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.transition = 'all 0.3s ease';
          card.style.boxShadow = '0 0 20px rgba(249, 115, 22, 0.6)';
          card.style.borderColor = 'var(--primary)';
          playMelodyBaDing();
          setTimeout(() => {
            card.style.boxShadow = '';
            card.style.borderColor = '';
          }, 1800);
        }
      });
    }
  });

});

