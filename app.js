(() => {
  /*
   * PAZY CONTENT PLANNER
   *
   * REGRA PRINCIPAL:
   * PROGRAMADO != FEITO
   *
   * Programação serve somente para mostrar se aquela tarefa
   * já foi planejada para a data.
   *
   * Checkbox é 100% manual:
   * clicar = marcar
   * clicar novamente = desmarcar
   */

  const STORAGE_KEY = "pazy-content-planner-v5";

  /* =========================================================
     CRONOGRAMA OFICIAL
     
     0 = domingo
     1 = segunda
     2 = terça
     3 = quarta
     4 = quinta
     5 = sexta
     6 = sábado
  ========================================================= */

  const ROUTINES = {
    instagram: {
      0: [],
      1: [
        "Frase do dia",
        "Carrossel",
        "Cortes",
        "Cartinha"
      ],
      2: [
        "Carrossel do artigo",
        "Cortes",
        "Cartinha",
        "Story do artigo"
      ],
      3: [
        "O que eu diria",
        "Frase do dia",
        "Cortes",
        "Cartinha"
      ],
      4: [
        "Story do novo episódio",
        "Cortes do episódio",
        "Cartinha"
      ],
      5: [
        "Story do Pazy by Pazy",
        "Cortes",
        "Cartinha"
      ],
      6: []
    },

    tiktok: {
      0: [],
      1: [
        "Frase"
      ],
      2: [],
      3: [
        "Frase",
        "O que eu diria"
      ],
      4: [
        "Corte do podcast"
      ],
      5: [],
      6: []
    },

    linkedin: {
      0: [],
      1: [
        "Post 3.000 — tema de TI"
      ],
      2: [
        "Newsletter — Atitude de Líder"
      ],
      3: [
        "Post 3.000 — tema de TI"
      ],
      4: [
        "Vídeo curto do podcast — só se o convidado é ativo no LinkedIn"
      ],
      5: [
        "Carrossel geral"
      ],
      6: []
    },

    youtube: {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [
        "Vídeo longo — Papo com a Pazy ou Lado B"
      ],
      5: [
        "Pazy by Pazy"
      ],
      6: []
    },

    spotify: {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [
        "Episódio em áudio"
      ],
      5: [
        "Pazy by Pazy em áudio"
      ],
      6: []
    },

    substack: {
      0: [],
      1: [],
      2: [
        "Artigo longo — o mesmo do LinkedIn"
      ],
      3: [],
      4: [],
      5: [],
      6: []
    }
  };

  const PLATFORM_LABELS = {
    instagram: "Instagram",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    spotify: "Spotify",
    substack: "Substack"
  };

  const PLATFORM_ORDER = [
    "instagram",
    "tiktok",
    "linkedin",
    "youtube",
    "spotify",
    "substack"
  ];

  /* =========================================================
     PROGRAMAÇÃO INICIAL
  ========================================================= */

  const INITIAL_PROGRAMMED_UNTIL = {
    "Cartinha": "2026-11-06",
    "Frase do dia": "2026-10-28",
    "Frase": "2026-10-28",
    "Carrossel": "2026-10-26",
    "Carrossel do artigo": "2026-10-27",
    "Post 3.000 — tema de TI": "2026-10-28",
    "Newsletter — Atitude de Líder": "2026-10-27",
    "Carrossel geral": "2026-10-30",
    "Cortes": "2026-10-16",
    "O que eu diria": "2026-10-28",
    "Pazy by Pazy": "2026-10-23",
    "Story do Pazy by Pazy": "2026-10-23",
    "Corte do podcast": "2026-10-16",
    "Cortes do episódio": "2026-10-16",
    "Artigo longo — o mesmo do LinkedIn": "2026-10-27"
  };

  const INITIAL_NOTE = `Conteúdos Pazy Outubro

Cartinhas programadas até dia 06/11
Frases programadas até dia 28/10
Carrosséis Insta programados até dia 26/10
Carrosséis LinkedIn programados até dia 30/10
Post 3.000 programado até dia 28/10
Newsletter programada até dia 27/10
Cortes programados até dia 16/10
O que eu diria programado até dia 28/10
Pazy by Pazy programado até dia 23/10

Papo Com A Pazy`;

  /* =========================================================
     ESTADO
  ========================================================= */

  const state = loadState();

  function loadState() {
    try {
      const current = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (current) {
        return {
          currentWeek: current.currentWeek
            ? new Date(`${current.currentWeek}T12:00:00`)
            : getMonday(new Date()),

          manualDone: migrateManualDone(
            current.manualDone || {}
          ),

          extras: current.extras || {},

          programmedUntil: {
            ...INITIAL_PROGRAMMED_UNTIL,
            ...(current.programmedUntil || {})
          },

          planningNote:
            current.planningNote || INITIAL_NOTE
        };
      }

      return {
        currentWeek: getMonday(new Date()),
        manualDone: {},
        extras: {},
        programmedUntil: {
          ...INITIAL_PROGRAMMED_UNTIL
        },
        planningNote: INITIAL_NOTE
      };

    } catch {
      return {
        currentWeek: getMonday(new Date()),
        manualDone: {},
        extras: {},
        programmedUntil: {
          ...INITIAL_PROGRAMMED_UNTIL
        },
        planningNote: INITIAL_NOTE
      };
    }
  }

  /*
   * Mantém marcações antigas quando possível.
   *
   * Versões antigas usavam:
   * DATA__PLATAFORMA__TAREFA
   *
   * Agora usamos:
   * DATA__TAREFA
   */
  function migrateManualDone(oldData) {
    const result = {};

    Object.entries(oldData).forEach(
      ([oldId, value]) => {
        if (!value) return;

        const parts = oldId.split("__");

        if (parts.length >= 3) {
          const date = parts.shift();
          parts.shift();

          const task = parts.join("__");

          result[
            `${date}__${task}`
          ] = true;
        } else {
          result[oldId] = true;
        }
      }
    );

    return result;
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentWeek: formatDate(
          state.currentWeek
        ),

        manualDone:
          state.manualDone,

        extras:
          state.extras,

        programmedUntil:
          state.programmedUntil,

        planningNote:
          state.planningNote
      })
    );
  }

  /* =========================================================
     DATAS
  ========================================================= */

  function getMonday(date) {
    const d = new Date(date);

    d.setHours(12, 0, 0, 0);

    const day = d.getDay();

    const diff =
      day === 0
        ? -6
        : 1 - day;

    d.setDate(
      d.getDate() + diff
    );

    return d;
  }

  function addDays(date, amount) {
    const d = new Date(date);

    d.setDate(
      d.getDate() + amount
    );

    return d;
  }

  function getToday() {
    const d = new Date();

    d.setHours(12, 0, 0, 0);

    return d;
  }

  function formatDate(date) {
    return [
      date.getFullYear(),
      String(
        date.getMonth() + 1
      ).padStart(2, "0"),
      String(
        date.getDate()
      ).padStart(2, "0")
    ].join("-");
  }

  function formatBR(date) {
    return date.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit"
      }
    );
  }

  function formatLongDate(date) {
    return date.toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );
  }

  function formatWeekRange(start) {
    const end =
      addDays(start, 6);

    return `${formatBR(start)} — ${formatBR(end)}`;
  }

  function isToday(date) {
    return (
      formatDate(date) ===
      formatDate(getToday())
    );
  }

  /* =========================================================
     TEXTO
  ========================================================= */

  function normalizeText(text) {
    return String(text)
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  /* =========================================================
     PROGRAMAÇÃO
  ========================================================= */

  function getPlanningKey(taskName) {
    const normalized =
      normalizeText(taskName);

    const directAliases = {
      "cartinha": "Cartinha",

      "frase do dia":
        "Frase do dia",

      "frase":
        "Frase",

      "carrossel":
        "Carrossel",

      "carrossel do artigo":
        "Carrossel do artigo",

      "cortes":
        "Cortes",

      "o que eu diria":
        "O que eu diria",

      "post 3.000 — tema de ti":
        "Post 3.000 — tema de TI",

      "post 3000 — tema de ti":
        "Post 3.000 — tema de TI",

      "newsletter — atitude de lider":
        "Newsletter — Atitude de Líder",

      "newsletter":
        "Newsletter — Atitude de Líder",

      "carrossel geral":
        "Carrossel geral",

      "pazy by pazy":
        "Pazy by Pazy",

      "story do pazy by pazy":
        "Story do Pazy by Pazy",

      "corte do podcast":
        "Corte do podcast",

      "cortes do episodio":
        "Cortes do episódio",

      "cortes do episódio":
        "Cortes do episódio",

      "story do novo episodio":
        "Story do novo episódio",

      "story do novo episódio":
        "Story do novo episódio",

      "story do artigo":
        "Story do artigo",

      "artigo longo":
        "Artigo longo — o mesmo do LinkedIn",

      "artigo longo — o mesmo do linkedin":
        "Artigo longo — o mesmo do LinkedIn",

      "episodio em audio":
        "Episódio em áudio",

      "episódio em áudio":
        "Episódio em áudio",

      "pazy by pazy em audio":
        "Pazy by Pazy em áudio",

      "pazy by pazy em áudio":
        "Pazy by Pazy em áudio"
    };

    return (
      directAliases[normalized] ||
      taskName
    );
  }

  function isProgrammed(
    taskName,
    date
  ) {
    const key =
      getPlanningKey(taskName);

    const limit =
      state.programmedUntil[key];

    if (!limit) {
      return false;
    }

    return (
      formatDate(date) <= limit
    );
  }

  /* =========================================================
     CHECKLIST MANUAL
  ========================================================= */

  function getTaskId(
    date,
    taskName
  ) {
    return [
      formatDate(date),
      normalizeText(taskName)
    ].join("__");
  }

  function isDone(
    date,
    taskName
  ) {
    return Boolean(
      state.manualDone[
        getTaskId(
          date,
          taskName
        )
      ]
    );
  }

  function toggleTask(
    date,
    taskName
  ) {
    const id =
      getTaskId(
        date,
        taskName
      );

    /*
     * 100% MANUAL.
     *
     * Programação não interfere.
     */

    if (
      state.manualDone[id]
    ) {
      delete state.manualDone[id];
    } else {
      state.manualDone[id] = true;
    }

    saveState();

    render();
  }

  /* =========================================================
     TAREFAS EXTRAS
  ========================================================= */

  function getExtras(date) {
    return (
      state.extras[
        formatDate(date)
      ] || []
    );
  }

  function addExtra(
    date,
    text
  ) {
    const clean =
      String(text || "")
        .trim();

    if (!clean) return;

    const key =
      formatDate(date);

    if (
      !state.extras[key]
    ) {
      state.extras[key] = [];
    }

    state.extras[key].push({
      id:
        `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,

      text:
        clean,

      completed:
        false
    });

    saveState();

    render();
  }

  function toggleExtra(
    date,
    id
  ) {
    const key =
      formatDate(date);

    const list =
      state.extras[key] || [];

    const item =
      list.find(
        extra =>
          extra.id === id
      );

    if (!item) return;

    item.completed =
      !item.completed;

    saveState();

    render();
  }

  /* =========================================================
     TAREFAS DO DIA
  ========================================================= */

  function getTasksForDay(date) {
    const weekday =
      date.getDay();

    const result = {};

    PLATFORM_ORDER.forEach(
      platform => {
        result[platform] =
          ROUTINES[platform][weekday] ||
          [];
      }
    );

    return result;
  }

  /* =========================================================
     RENDER DE TAREFA
  ========================================================= */

  function buildTaskHTML(
    date,
    taskName
  ) {
    const done =
      isDone(
        date,
        taskName
      );

    const programmed =
      isProgrammed(
        taskName,
        date
      );

    return `
      <label
        class="task ${
          done
            ? "completed"
            : ""
        }"
      >

        <input
          type="checkbox"
          class="task-checkbox"
          data-task-id="${escapeHTML(
            getTaskId(
              date,
              taskName
            )
          )}"
          ${
            done
              ? "checked"
              : ""
          }
        >

        <span class="task-label">

          ${escapeHTML(
            taskName
          )}

          ${
            programmed
              ? `
                <span
                  style="
                    font-size:10px;
                    color:#999;
                    margin-left:5px;
                    white-space:nowrap;
                  "
                >
                  programado
                </span>
              `
              : `
                <span
                  style="
                    font-size:11px;
                    color:#a76500;
                    margin-left:5px;
                  "
                  title="Ainda não informado como programado"
                >
                  ⚠
                </span>
              `
          }

        </span>

      </label>
    `;
  }

  /* =========================================================
     COLUNA DO DIA
  ========================================================= */

  function renderDay(date) {
    const tasks =
      getTasksForDay(date);

    const today =
      isToday(date);

    let total = 0;
    let done = 0;

    PLATFORM_ORDER.forEach(
      platform => {

        const list =
          tasks[platform] || [];

        list.forEach(
          task => {

            total++;

            if (
              isDone(
                date,
                task
              )
            ) {
              done++;
            }

          }
        );
      }
    );

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (done / total) *
            100
          );

    return `
      <section
        class="day-column ${
          today
            ? "today"
            : ""
        }"
      >

        <header
          class="day-header"
        >

          <span
            class="day-name"
          >
            ${date.toLocaleDateString(
              "pt-BR",
              {
                weekday:
                  "short"
              }
            )}
          </span>

          <span
            class="day-date"
          >
            ${date.getDate()}
          </span>

          ${
            today
              ? `
                <span
                  class="today-label"
                >
                  HOJE
                </span>
              `
              : ""
          }

        </header>


        <div
          class="day-content"
        >

          ${renderPlatformSections(
            date,
            tasks
          )}


          <div
            class="day-progress"
          >

            <div
              class="progress-text"
            >

              <span>
                ${done}/${total} feitas
              </span>

              <span>
                ${percentage}%
              </span>

            </div>

            <div
              class="progress-track"
            >

              <div
                class="progress-bar"
                style="
                  width:${percentage}%;
                "
              ></div>

            </div>

          </div>

        </div>

      </section>
    `;
  }

  function renderPlatformSections(
    date,
    tasks
  ) {
    let html = "";

    PLATFORM_ORDER.forEach(
      platform => {

        const list =
          tasks[platform] || [];

        if (!list.length) {
          return;
        }

        html += `
          <div
            class="platform-section"
          >

            <h3
              class="platform-title"
            >
              ${PLATFORM_LABELS[
                platform
              ]}
            </h3>

            <div
              class="task-list"
            >

              ${list
                .map(
                  task =>
                    buildTaskHTML(
                      date,
                      task
                    )
                )
                .join("")}

            </div>

          </div>
        `;
      }
    );

    return html;
  }

  function renderWeek() {
    const columns = [];

    for (
      let i = 0;
      i < 7;
      i++
    ) {
      columns.push(
        renderDay(
          addDays(
            state.currentWeek,
            i
          )
        )
      );
    }

    return columns.join("");
  }

  /* =========================================================
     PAINEL HOJE
  ========================================================= */

  function renderTodayPanel() {
    const today =
      getToday();

    const tasks =
      getTasksForDay(
        today
      );

    const extras =
      getExtras(today);

    return `
      <aside
        class="today-panel"
      >

        <h3>
          Hoje
        </h3>

        <p
          class="today-panel-date"
        >
          ${escapeHTML(
            formatLongDate(
              today
            )
          )}
        </p>


        ${renderTodayPlatforms(
          today,
          tasks
        )}


        <section
          class="today-section"
        >

          <h4
            class="today-section-title"
          >
            Tarefas extras
          </h4>

          <div
            class="task-list"
          >

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

                          <span
                            class="task-label"
                          >
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


          <div
            class="add-extra"
          >

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


        <section
          class="today-section"
        >

          <h4
            class="today-section-title"
          >
            ⚠ Não programado
          </h4>

          <div
            class="task-list"
          >
            ${renderUnplannedToday(
              tasks,
              today
            )}
          </div>

        </section>

      </aside>
    `;
  }

  function renderTodayPlatforms(
    date,
    tasks
  ) {
    let html = "";

    PLATFORM_ORDER.forEach(
      platform => {

        const list =
          tasks[platform] || [];

        if (!list.length) {
          return;
        }

        html += `
          <section
            class="today-section"
          >

            <h4
              class="today-section-title"
            >
              ${PLATFORM_LABELS[
                platform
              ]}
            </h4>

            <div
              class="task-list"
            >

              ${list
                .map(
                  task =>
                    buildTaskHTML(
                      date,
                      task
                    )
                )
                .join("")}

            </div>

          </section>
        `;
      }
    );

    return html;
  }

  function renderUnplannedToday(
    tasks,
    date
  ) {
    const list = [];

    PLATFORM_ORDER.forEach(
      platform => {

        const taskList =
          tasks[platform] || [];

        taskList.forEach(
          task => {

            if (
              !isProgrammed(
                task,
                date
              )
            ) {
              list.push({
                platform,
                task
              });
            }

          }
        );
      }
    );

    if (!list.length) {
      return `
        <span
          style="
            font-size:12px;
            color:#999;
          "
        >
          Nenhuma tarefa fora
          do planejamento.
        </span>
      `;
    }

    return list
      .map(
        item => {

          const done =
            isDone(
              date,
              item.task
            );

          return `
            <span
              style="
                font-size:12px;
                line-height:1.4;
                ${
                  done
                    ? "color:#999;"
                    : ""
                }
              "
            >
              ${done ? "☑" : "⚠"}
              ${escapeHTML(
                item.task
              )}
            </span>
          `;
        }
      )
      .join("");
  }

  /* =========================================================
     RESUMO
  ========================================================= */

  function getWeekSummary() {
    let total = 0;
    let done = 0;

    for (
      let i = 0;
      i < 7;
      i++
    ) {

      const date =
        addDays(
          state.currentWeek,
          i
        );

      const tasks =
        getTasksForDay(
          date
        );

      PLATFORM_ORDER.forEach(
        platform => {

          const list =
            tasks[platform] ||
            [];

          list.forEach(
            task => {

              total++;

              if (
                isDone(
                  date,
                  task
                )
              ) {
                done++;
              }

            }
          );
        }
      );
    }

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (done / total) *
            100
          );

    return {
      total,
      done,
      percentage
    };
  }

  /* =========================================================
     NOTES
  ========================================================= */

  function openUpdateModal() {
    const modal =
      document.getElementById(
        "update-modal"
      );

    const textarea =
      document.getElementById(
        "update-text"
      );

    if (textarea) {
      textarea.value =
        state.planningNote || "";
    }

    modal?.classList.add(
      "open"
    );
  }

  function closeUpdateModal() {
    document
      .getElementById(
        "update-modal"
      )
      ?.classList.remove(
        "open"
      );
  }

  function detectPlanningKey(
    normalized
  ) {

    if (
      normalized.includes(
        "carrosseis linkedin"
      ) ||
      normalized.includes(
        "carrossel linkedin"
      )
    ) {
      return "Carrossel geral";
    }

    if (
      normalized.includes(
        "carrosseis insta"
      ) ||
      normalized.includes(
        "carrossel insta"
      )
    ) {
      return "Carrossel";
    }

    if (
      normalized.includes(
        "carrossel do artigo"
      )
    ) {
      return "Carrossel do artigo";
    }

    if (
      normalized.includes(
        "carrossel"
      )
    ) {
      return "Carrossel";
    }

    if (
      normalized.includes(
        "cartinh"
      )
    ) {
      return "Cartinha";
    }

    if (
      normalized.includes(
        "frase do dia"
      )
    ) {
      return "Frase do dia";
    }

    if (
      normalized === "frase"
    ) {
      return "Frase";
    }

    if (
      normalized.includes(
        "post 3.000"
      ) ||
      normalized.includes(
        "post 3000"
      )
    ) {
      return "Post 3.000 — tema de TI";
    }

    if (
      normalized.includes(
        "newsletter"
      )
    ) {
      return "Newsletter — Atitude de Líder";
    }

    if (
      normalized.includes(
        "o que eu diria"
      )
    ) {
      return "O que eu diria";
    }

    if (
      normalized === "cortes"
    ) {
      return "Cortes";
    }

    if (
      normalized.includes(
        "pazy by pazy em audio"
      )
    ) {
      return "Pazy by Pazy em áudio";
    }

    if (
      normalized.includes(
        "pazy by pazy"
      )
    ) {
      return "Pazy by Pazy";
    }

    if (
      normalized.includes(
        "corte do podcast"
      )
    ) {
      return "Corte do podcast";
    }

    if (
      normalized.includes(
        "cortes do episodio"
      )
    ) {
      return "Cortes do episódio";
    }

    if (
      normalized.includes(
        "story do novo episodio"
      )
    ) {
      return "Story do novo episódio";
    }

    if (
      normalized.includes(
        "story do artigo"
      )
    ) {
      return "Story do artigo";
    }

    if (
      normalized.includes(
        "artigo longo"
      )
    ) {
      return "Artigo longo — o mesmo do LinkedIn";
    }

    if (
      normalized.includes(
        "episodio em audio"
      )
    ) {
      return "Episódio em áudio";
    }

    return null;
  }

  function applyPlanningNote(
    text
  ) {
    const lines =
      String(text || "")
        .split("\n")
        .map(
          line => line.trim()
        )
        .filter(Boolean);

    let changes = 0;

    lines.forEach(
      line => {

        const normalized =
          normalizeText(line);

        const key =
          detectPlanningKey(
            normalized
          );

        if (!key) {
          return;
        }

        const match =
          line.match(
            /(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{4}))?/
          );

        if (!match) {
          return;
        }

        const day =
          Number(match[1]);

        const month =
          Number(match[2]);

        const year =
          match[3]
            ? Number(match[3])
            : 2026;

        const date =
          `${year}-${String(
            month
          ).padStart(
            2,
            "0"
          )}-${String(
            day
          ).padStart(
            2,
            "0"
          )}`;

        state.programmedUntil[
          key
        ] = date;

        changes++;
      }
    );

    return changes;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  function render() {
    const summary =
      getWeekSummary();

    document.body.innerHTML = `
      <div
        class="app"
      >

        <header
          class="header"
        >

          <div
            class="header-left"
          >

            <div>

              <h1
                class="title"
              >
                Pazy Content Planner
              </h1>

              <p
                class="subtitle"
              >
                Organização semanal de conteúdo
              </p>

            </div>

          </div>


          <div
            class="header-actions"
          >

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


        <div
          class="week-navigation"
        >

          <button
            class="nav-button"
            id="previous-week"
            type="button"
          >
            ←
          </button>


          <div
            class="week-title"
          >

            <h2>
              ${formatWeekRange(
                state.currentWeek
              )}
            </h2>

            <p>
              ${state.currentWeek.toLocaleDateString(
                "pt-BR",
                {
                  month:
                    "long",
                  year:
                    "numeric"
                }
              )}
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


        <div
          class="main-layout"
        >

          <main>

            <div
              class="week-board"
            >

              <div
                class="week-scroll"
              >

                <div
                  class="week-grid"
                >
                  ${renderWeek()}
                </div>

              </div>

            </div>


            <div
              class="week-summary"
            >

              <strong>
                ${summary.done}/${summary.total}
              </strong>

              tarefas feitas

              <span
                style="
                  color:#999;
                  margin-left:8px;
                "
              >
                · ${summary.percentage}%
              </span>

            </div>

          </main>


          ${renderTodayPanel()}

        </div>

      </div>


      <!-- NOTES -->

      <div
        class="modal-overlay"
        id="update-modal"
      >

        <div
          class="modal"
        >

          <div
            class="modal-header"
          >

            <div>

              <h2>
                Atualizar conteúdos
              </h2>

              <p
                style="
                  margin:6px 0 0;
                  color:#777;
                  font-size:13px;
                "
              >
                Seu Notes de planejamento
              </p>

            </div>


            <button
              class="close-button"
              id="close-modal"
              type="button"
            >
              ×
            </button>

          </div>


          <textarea
            id="update-text"
            spellcheck="true"
            placeholder="Escreva aqui seu planejamento..."
          >${escapeHTML(
            state.planningNote || ""
          )}</textarea>


          <p
            style="
              color:#888;
              font-size:12px;
              line-height:1.5;
              margin:10px 0 0;
            "
          >
            O Notes salva automaticamente.
            Linhas com conteúdo + data podem
            atualizar a programação.
          </p>


          <div
            class="modal-footer"
          >

            <button
              class="button"
              id="save-note"
              type="button"
            >
              Salvar nota
            </button>

            <button
              class="button button-primary"
              id="apply-planning"
              type="button"
            >
              Aplicar ao calendário
            </button>

          </div>

        </div>

      </div>
    `;

    bindEvents();
  }

  /* =========================================================
     EVENTOS
  ========================================================= */

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
        openUpdateModal
      );


    document
      .getElementById(
        "close-modal"
      )
      ?.addEventListener(
        "click",
        closeUpdateModal
      );


    /*
     * NOTES salva enquanto você digita.
     */

    document
      .getElementById(
        "update-text"
      )
      ?.addEventListener(
        "input",
        event => {

          state.planningNote =
            event.target.value;

          saveState();
        }
      );


    /*
     * Salvar Notes
     */

    document
      .getElementById(
        "save-note"
      )
      ?.addEventListener(
        "click",
        () => {

          const textarea =
            document.getElementById(
              "update-text"
            );

          state.planningNote =
            textarea?.value || "";

          saveState();

          closeUpdateModal();

          render();
        }
      );


    /*
     * Aplicar datas ao calendário
     */

    document
      .getElementById(
        "apply-planning"
      )
      ?.addEventListener(
        "click",
        () => {

          const textarea =
            document.getElementById(
              "update-text"
            );

          const text =
            textarea?.value || "";

          state.planningNote =
            text;

          const changes =
            applyPlanningNote(
              text
            );

          saveState();

          closeUpdateModal();

          render();

          alert(
            changes > 0
              ? `${changes} programação(ões) atualizada(s).`
              : "Não encontrei nenhuma linha com conteúdo e data."
          );
        }
      );


    /*
     * CHECKBOXES.
     *
     * 100% MANUAIS.
     */

    document
      .querySelectorAll(
        "input[data-task-id]"
      )
      .forEach(
        input => {

          input.addEventListener(
            "change",
            event => {

              const id =
                event.target
                  .dataset
                  .taskId;

              const parts =
                id.split(
                  "__"
                );

              const dateString =
                parts.shift();

              const taskName =
                parts.join(
                  "__"
                );

              const date =
                new Date(
                  `${dateString}T12:00:00`
                );

              toggleTask(
                date,
                taskName
              );
            }
          );

        }
      );


    /*
     * TAREFAS EXTRAS
     */

    document
      .querySelectorAll(
        "input[data-extra-id]"
      )
      .forEach(
        input => {

          input.addEventListener(
            "change",
            event => {

              toggleExtra(
                getToday(),
                event.target
                  .dataset
                  .extraId
              );
            }
          );

        }
      );


    /*
     * Nova tarefa extra
     */

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


    /*
     * Enter na tarefa extra
     */

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

  /* =========================================================
     INÍCIO
  ========================================================= */

  saveState();

  render();

})();
