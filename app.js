(() => {
  const STORAGE_KEY = "pazy-content-planner-v2";

  const defaultData = {
    routines: {
      instagramTikTok: {
        1: [
          "Corte Pazy by Pazy",
          "Carrossel",
          "Frase",
          "Story Cartinha"
        ],
        2: [
          "Corte Pazy by Pazy",
          "Story Artigo com Link",
          "Carrossel Artigo",
          "Story Cartinha"
        ],
        3: [
          "Corte Pazy by Pazy",
          "Frase",
          "Story Cartinha"
        ],
        4: [
          "Story Podcast",
          "Corte Podcast",
          "Story Cartinha"
        ],
        5: [
          "Story Pazy by Pazy",
          "Corte Pazy by Pazy",
          "Story Cartinha"
        ],
        6: [
          "Cartinha"
        ],
        0: [
          "Cartinha"
        ]
      },

      linkedin: {
        1: [
          "Post 3000"
        ],
        2: [
          "Artigo"
        ],
        3: [
          "Post TI"
        ],
        4: [
          "Colocar link (caso tenha vídeo)",
          "Vídeo Curto Podcast"
        ],
        5: [
          "Carrossel LinkedIn"
        ]
      }
    },

    programmedUntil: {
      "Cartinha": "2026-11-06",
      "Frase": "2026-10-28",
      "Carrossel": "2026-10-26",
      "Carrossel Artigo": "2026-10-26",
      "Carrossel LinkedIn": "2026-10-30",
      "Post TI": "2026-10-28",
      "Post 3000": "2026-10-26",
      "Pazy by Pazy": "2026-10-23",
      "Corte Pazy by Pazy": "2026-10-16"
    }
  };

  const state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (!saved) {
        return {
          currentWeek: getMonday(new Date()),
          completed: {},
          extras: {},
          programmedUntil: {
            ...defaultData.programmedUntil
          }
        };
      }

      return {
        currentWeek: saved.currentWeek
          ? new Date(saved.currentWeek + "T12:00:00")
          : getMonday(new Date()),

        completed: saved.completed || {},

        extras: saved.extras || {},

        programmedUntil: {
          ...defaultData.programmedUntil,
          ...(saved.programmedUntil || {})
        }
      };
    } catch {
      return {
        currentWeek: getMonday(new Date()),
        completed: {},
        extras: {},
        programmedUntil: {
          ...defaultData.programmedUntil
        }
      };
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentWeek: formatDate(state.currentWeek),
        completed: state.completed,
        extras: state.extras,
        programmedUntil: state.programmedUntil
      })
    );
  }

  function getMonday(date) {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);

    const day = d.getDay();

    const diff = day === 0
      ? -6
      : 1 - day;

    d.setDate(d.getDate() + diff);

    return d;
  }

  function addDays(date, amount) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
  }

  function formatDate(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatBR(date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    });
  }

  function formatLongDate(date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function formatWeekRange(start) {
    const end = addDays(start, 6);

    return `${formatBR(start)} — ${formatBR(end)}`;
  }

  function getToday() {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today;
  }

  function isToday(date) {
    return formatDate(date) === formatDate(getToday());
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(text) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getProgrammedUntil(taskName) {
    const normalized = normalizeText(taskName);

    // Story Cartinha usa a mesma programação de Cartinha
    if (
      normalized === "story cartinha" ||
      normalized === "cartinha"
    ) {
      return state.programmedUntil["Cartinha"] || null;
    }

    // Story Pazy by Pazy usa a programação de Pazy by Pazy
    if (normalized === "story pazy by pazy") {
      return state.programmedUntil["Pazy by Pazy"] || null;
    }

    const exactKey = Object.keys(state.programmedUntil).find(
      key => normalizeText(key) === normalized
    );

    return exactKey
      ? state.programmedUntil[exactKey]
      : null;
  }

  function isProgrammed(taskName, date) {
    const limit = getProgrammedUntil(taskName);

    // Se ainda não existe uma regra de programação para esse
    // tipo de tarefa, não pintar de amarelo automaticamente.
    if (!limit) {
      return true;
    }

    return formatDate(date) <= limit;
  }

  function isOutsideProgrammedPeriod(taskName, date) {
    const limit = getProgrammedUntil(taskName);

    if (!limit) {
      return false;
    }

    return formatDate(date) > limit;
  }

  function taskId(date, platform, taskName) {
    return `${formatDate(date)}__${platform}__${normalizeText(taskName)}`;
  }
function isCompleted(date, platform, taskName) {
    const id = taskId(date, platform, taskName);

    // Se você marcou manualmente esta tarefa,
    // respeitamos essa escolha.
    if (
      Object.prototype.hasOwnProperty.call(
        state.completed,
        id
      )
    ) {
      return state.completed[id];
    }

    // Caso contrário, o checkbox acompanha
    // automaticamente o planejamento.
    return isProgrammed(taskName, date);
  }

  function setCompleted(
    date,
    platform,
    taskName,
    value
  ) {
    const id = taskId(date, platform, taskName);

    if (value) {
      state.completed[id] = true;
    } else {
      delete state.completed[id];
    }

    saveState();
    render();
  }

  function getExtras(date) {
    return state.extras[formatDate(date)] || [];
  }

  function addExtra(date, text) {
    const clean = text.trim();

    if (!clean) return;

    const key = formatDate(date);

    if (!state.extras[key]) {
      state.extras[key] = [];
    }

    state.extras[key].push({
      id: `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,
      text: clean,
      completed: false
    });

    saveState();
    render();
  }

  function toggleExtra(date, id) {
    const key = formatDate(date);
    const extras = state.extras[key] || [];

    const item = extras.find(
      extra => extra.id === id
    );

    if (!item) return;

    item.completed = !item.completed;

    saveState();
    render();
  }

  function getTasksForDay(date) {
    const weekday = date.getDay();

    return {
      instagramTikTok:
        defaultData.routines.instagramTikTok[weekday] || [],

      linkedin:
        defaultData.routines.linkedin[weekday] || []
    };
  }

  function buildTaskHTML(
    date,
    platform,
    taskName
  ) {
    const completed = isCompleted(
      date,
      platform,
      taskName
    );

    const outsideProgrammedPeriod =
      isOutsideProgrammedPeriod(
        taskName,
        date
      );

    let classes = "task";

    if (completed) {
      classes += " completed";
    }

    const id = taskId(
      date,
      platform,
      taskName
    );

    return `
      <label class="${classes}">
        <input
          type="checkbox"
          data-task-id="${escapeHTML(id)}"
          ${completed ? "checked" : ""}
        >

        <span class="task-label">
          ${
            outsideProgrammedPeriod
              ? `<span class="unplanned-mark">⚠ </span>`
              : ""
          }

          ${escapeHTML(taskName)}
        </span>
      </label>
    `;
  }

  function renderDay(date) {
    const tasks = getTasksForDay(date);

    const today = isToday(date);

    let total = 0;
    let completed = 0;

    Object.entries(tasks).forEach(
      ([platform, taskList]) => {
        taskList.forEach(task => {
          total++;

          if (
            isCompleted(
              date,
              platform,
              task
            )
          ) {
            completed++;
          }
        });
      }
    );

    const percentage = total
      ? Math.round(
          (completed / total) * 100
        )
      : 0;

    return `
      <section
        class="day-column ${today ? "today" : ""}"
      >

        <header class="day-header">

          <span class="day-name">
            ${date
              .toLocaleDateString(
                "pt-BR",
                { weekday: "short" }
              )}
          </span>

          <span class="day-date">
            ${date.getDate()}
          </span>

          ${
            today
              ? `<span class="today-label">HOJE</span>`
              : ""
          }

        </header>

        <div class="day-content">

          <div class="platform-section">

            <h3 class="platform-title">
              Instagram / TikTok
            </h3>

            <div class="task-list">
              ${
                tasks.instagramTikTok
                  .map(task =>
                    buildTaskHTML(
                      date,
                      "instagramTikTok",
                      task
                    )
                  )
                  .join("")
              }
            </div>

          </div>

          <div class="platform-section">

            <h3 class="platform-title">
              LinkedIn
            </h3>

            <div class="task-list">
              ${
                tasks.linkedin.length
                  ? tasks.linkedin
                      .map(task =>
                        buildTaskHTML(
                          date,
                          "linkedin",
                          task
                        )
                      )
                      .join("")
                  : `<span style="color:#999;font-size:12px;">—</span>`
              }
            </div>

          </div>

          <div class="day-progress">

            <div class="progress-text">
              <span>
                ${completed}/${total}
              </span>

              <span>
                ${percentage}%
              </span>
            </div>

            <div class="progress-track">
              <div
                class="progress-bar"
                style="width:${percentage}%"
              ></div>
            </div>

          </div>

        </div>

      </section>
    `;
  }

  function renderWeek() {
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(
        renderDay(
          addDays(
            state.currentWeek,
            i
          )
        )
      );
    }

    return days.join("");
  }

  function renderTodayPanel() {
    const today = getToday();

    const tasks = getTasksForDay(today);
    const extras = getExtras(today);

    return `
      <aside class="today-panel">

        <h3>Hoje</h3>

        <p class="today-panel-date">
          ${escapeHTML(
            formatLongDate(today)
          )}
        </p>

        <section class="today-section">

          <h4 class="today-section-title">
            Instagram / TikTok
          </h4>

          <div class="task-list">
            ${
              tasks.instagramTikTok
                .map(task =>
                  buildTaskHTML(
                    today,
                    "instagramTikTok",
                    task
                  )
                )
                .join("")
            }
          </div>

        </section>

        <section class="today-section">

          <h4 class="today-section-title">
            LinkedIn
          </h4>

          <div class="task-list">
            ${
              tasks.linkedin
                .map(task =>
                  buildTaskHTML(
                    today,
                    "linkedin",
                    task
                  )
                )
                .join("")
            }
          </div>

        </section>

        <section class="today-section">

          <h4 class="today-section-title">
            Tarefas extras
          </h4>

          <div class="task-list">

            ${
              extras.length
                ? extras
                    .map(
                      extra => `
                        <label
                          class="task ${
                            extra.completed
                              ? "completed"
                              : ""
                          }"
                        >

                          <input
                            type="checkbox"
                            data-extra-id="${escapeHTML(
                              extra.id
                            )}"
                            ${
                              extra.completed
                                ? "checked"
                                : ""
                            }
                          >

                          <span class="task-label">
                            ${escapeHTML(
                              extra.text
                            )}
                          </span>

                        </label>
                      `
                    )
                    .join("")
                : `
                    <span
                      style="
                        font-size:12px;
                        color:#999;
                      "
                    >
                      Nenhuma tarefa extra.
                    </span>
                  `
            }

          </div>

          <div class="add-extra">

            <input
              id="extra-task-input"
              type="text"
              placeholder="Adicionar tarefa..."
            >

            <button
              class="button"
              id="add-extra-button"
              type="button"
            >
              +
            </button>

          </div>

        </section>

        <section class="today-section">

          <h4 class="today-section-title">
            ⚠ Não programado
          </h4>

          <div class="task-list">
            ${renderUnplannedToday(tasks)}
          </div>

        </section>

      </aside>
    `;
  }

  function renderUnplannedToday(tasks) {
    const all = [];

    Object.entries(tasks).forEach(
      ([platform, taskList]) => {
        taskList.forEach(task => {

          if (
            isOutsideProgrammedPeriod(
              task,
              getToday()
            )
          ) {
            all.push({
              platform,
              task
            });
          }

        });
      }
    );

    if (!all.length) {
      return `
        <span
          style="
            font-size:12px;
            color:#999;
          "
        >
          Nenhuma tarefa fora do planejamento.
        </span>
      `;
    }

    return all
      .map(item => {

        const done = isCompleted(
          getToday(),
          item.platform,
          item.task
        );

        return `
          <span
            style="
              font-size:12px;
              line-height:1.35;
              ${done ? "color:#999;" : ""}
            "
          >
            ${done ? "☑" : "⚠"}
            ${escapeHTML(item.task)}
          </span>
        `;

      })
      .join("");
  }

  function getWeekSummary() {
    let total = 0;
    let completed = 0;

    for (let i = 0; i < 7; i++) {

      const date = addDays(
        state.currentWeek,
        i
      );

      const tasks =
        getTasksForDay(date);

      Object.entries(tasks).forEach(
        ([platform, list]) => {

          list.forEach(task => {

            total++;

            if (
              isCompleted(
                date,
                platform,
                task
              )
            ) {
              completed++;
            }

          });

        }
      );

      getExtras(date).forEach(extra => {

        total++;

        if (extra.completed) {
          completed++;
        }

      });

    }

    const percentage = total
      ? Math.round(
          (completed / total) * 100
        )
      : 0;

    return {
      total,
      completed,
      percentage
    };
  }

  function render() {

    const summary =
      getWeekSummary();

    document.body.innerHTML = `
      <div class="app">

        <header class="header">

          <div class="header-left">

            <div>

              <h1 class="title">
                Pazy Content Planner
              </h1>

              <p class="subtitle">
                Organização semanal de conteúdo
              </p>

            </div>

          </div>

          <div class="header-actions">

            <button
              class="button"
              id="today-button"
              type="button"
            >
              Hoje
            </button>

            <button
              class="button button-primary"
              id="update-content-button"
              type="button"
            >
              + Atualizar conteúdos
            </button>

          </div>

        </header>

        <div class="week-navigation">

          <button
            class="nav-button"
            id="previous-week"
            type="button"
          >
            ←
          </button>

          <div class="week-title">

            <h2>
              ${formatWeekRange(
                state.currentWeek
              )}
            </h2>

            <p>
              ${
                state.currentWeek
                  .toLocaleDateString(
                    "pt-BR",
                    {
                      month: "long",
                      year: "numeric"
                    }
                  )
              }
            </p>

          </div>

          <button
            class="nav-button"
            id="next-week"
            type="button"
          >
            →
          </button>

        </div>

        <div class="main-layout">

          <main>

            <div class="week-board">

              <div class="week-scroll">

                <div class="week-grid">
                  ${renderWeek()}
                </div>

              </div>

            </div>

            <div class="week-summary">

              <strong>
                ${summary.completed}/${summary.total}
              </strong>

              tarefas concluídas nesta semana
              — ${summary.percentage}%

            </div>

          </main>

          ${renderTodayPanel()}

        </div>

      </div>

      <div
        class="modal-overlay"
        id="update-modal"
      >

        <div class="modal">

          <div class="modal-header">

            <h2>
              Atualizar conteúdos
            </h2>

            <button
              class="close-button"
              id="close-modal"
              type="button"
            >
              ×
            </button>

          </div>

          <p
            style="
              color:#777;
              font-size:13px;
              line-height:1.5;
            "
          >
            Cole aqui seu planejamento.
          </p>

          <textarea id="update-text">
Cartinhas programadas até dia 06/11
Frases programadas até dia 28/10
Carrosséis Insta programadas até dia 26/10
Carrosséis LinkedIn programadas até dia 30/10
Post TI programadas até dia 28/10
          </textarea>

          <div class="modal-footer">

            <button
              class="button"
              id="cancel-update"
              type="button"
            >
              Cancelar
            </button>

            <button
              class="button button-primary"
              id="save-update"
              type="button"
            >
              Atualizar
            </button>

          </div>

        </div>

      </div>
    `;

    bindEvents();
  }

  function parseUpdateText(text) {

    const lines = text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    let changes = 0;

    lines.forEach(line => {

      const normalized =
        normalizeText(line);

      if (!normalized.includes("ate")) {
        return;
      }

      const dateMatch = line.match(
        /(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{4}))?/
      );

      if (!dateMatch) {
        return;
      }

      const day =
        Number(dateMatch[1]);

      const month =
        Number(dateMatch[2]);

      const year =
        dateMatch[3]
          ? Number(dateMatch[3])
          : 2026;

      const isoDate =
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      let taskName = null;

      if (
        normalized.includes("cartinh")
      ) {
        taskName = "Cartinha";

      } else if (
        normalized.includes("frases")
      ) {
        taskName = "Frase";

      } else if (
        normalized.includes(
          "carrosseis linkedin"
        )
      ) {
        taskName =
          "Carrossel LinkedIn";

      } else if (
        normalized.includes(
          "carrosseis insta"
        )
      ) {
        taskName = "Carrossel";

      } else if (
        normalized.includes(
          "post ti"
        )
      ) {
        taskName = "Post TI";

      } else if (
        normalized.includes(
          "post 3000"
        )
      ) {
        taskName =
          "Post 3000";

      } else if (
        normalized.includes(
          "cortes pazy by pazy"
        )
      ) {
        taskName =
          "Corte Pazy by Pazy";

      } else if (
        normalized.includes(
          "pazy by pazy"
        )
      ) {
        taskName =
          "Pazy by Pazy";

      } else if (
        normalized.includes(
          "o que eu diria"
        )
      ) {
        taskName =
          "O que eu diria";

      } else if (
        normalized.includes(
          "olho no olho"
        )
      ) {
        taskName =
          "Olho no Olho";

      } else if (
        normalized.includes(
          "carrossel substack"
        )
      ) {
        taskName =
          "Carrossel Substack";
      }

      if (!taskName) {
        return;
      }

      state.programmedUntil[
        taskName
      ] = isoDate;

      changes++;
    });

    return changes;
  }

  function openModal() {

    const modal =
      document.getElementById(
        "update-modal"
      );

    modal?.classList.add("open");
  }

  function closeModal() {

    const modal =
      document.getElementById(
        "update-modal"
      );

    modal?.classList.remove("open");
  }

  function bindEvents() {

    document
      .getElementById(
        "previous-week"
      )
      ?.addEventListener(
        "click",
        () => {

          state.currentWeek =
            addDays(
              state.currentWeek,
              -7
            );

          saveState();
          render();

        }
      );

    document
      .getElementById(
        "next-week"
      )
      ?.addEventListener(
        "click",
        () => {

          state.currentWeek =
            addDays(
              state.currentWeek,
              7
            );

          saveState();
          render();

        }
      );

    document
      .getElementById(
        "today-button"
      )
      ?.addEventListener(
        "click",
        () => {

          state.currentWeek =
            getMonday(
              getToday()
            );

          saveState();
          render();

        }
      );

    document
      .getElementById(
        "update-content-button"
      )
      ?.addEventListener(
        "click",
        openModal
      );

    document
      .getElementById(
        "close-modal"
      )
      ?.addEventListener(
        "click",
        closeModal
      );

    document
      .getElementById(
        "cancel-update"
      )
      ?.addEventListener(
        "click",
        closeModal
      );

    document
      .getElementById(
        "save-update"
      )
      ?.addEventListener(
        "click",
        () => {

          const text =
            document.getElementById(
              "update-text"
            )?.value || "";

          const changes =
            parseUpdateText(text);

          saveState();
          closeModal();
          render();

          alert(
            changes > 0
              ? `${changes} atualização(ões) aplicada(s).`
              : "Não encontrei nenhuma linha de programação reconhecível."
          );
        }
      );

    document
      .querySelectorAll(
        'input[data-task-id]'
      )
      .forEach(input => {

        input.addEventListener(
          "change",
          event => {

            const id =
              event.target.dataset.taskId;

            const [
              dateString,
              platform,
              ...taskParts
            ] = id.split("__");

            const taskName =
              taskParts.join("__");

            const date =
              new Date(
                `${dateString}T12:00:00`
              );

            setCompleted(
              date,
              platform,
              taskName,
              event.target.checked
            );

          }
        );

      });

    document
      .querySelectorAll(
        'input[data-extra-id]'
      )
      .forEach(input => {

        input.addEventListener(
          "change",
          event => {

            toggleExtra(
              getToday(),
              event.target
                .dataset.extraId
            );

          }
        );

      });

    document
      .getElementById(
        "add-extra-button"
      )
      ?.addEventListener(
        "click",
        () => {

          const input =
            document.getElementById(
              "extra-task-input"
            );

          if (!input) return;

          addExtra(
            getToday(),
            input.value
          );

        }
      );

    document
      .getElementById(
        "extra-task-input"
      )
      ?.addEventListener(
        "keydown",
        event => {

          if (
            event.key !== "Enter"
          ) {
            return;
          }

          addExtra(
            getToday(),
            event.target.value
          );

        }
      );
  }

  saveState();
  render();
})();
