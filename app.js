(() => {
  /*
   * PAZY CONTENT PLANNER
   * Versão definitiva da lógica de checklist.
   *
   * REGRA PRINCIPAL:
   * PROGRAMADO != FEITO
   *
   * A programação serve apenas para informar se a tarefa
   * já foi planejada para determinada data.
   *
   * O checkbox é SEMPRE manual.
   */

  const STORAGE_KEY = "pazy-content-planner-v5";

  /* =========================================================
     ROTINA FIXA
     
     JavaScript:
     0 = domingo
     1 = segunda
     2 = terça
     3 = quarta
     4 = quinta
     5 = sexta
     6 = sábado
  ========================================================= */

  const ROUTINES = {
    instagramTikTok: {
      0: [
        "Cartinha"
      ],

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
  };

  /* =========================================================
     PROGRAMAÇÃO INICIAL
  ========================================================= */

  const INITIAL_PROGRAMMED_UNTIL = {
    "Cartinha": "2026-11-06",
    "Frase": "2026-10-28",
    "Carrossel": "2026-10-26",
    "Carrossel Artigo": "2026-10-26",
    "Carrossel LinkedIn": "2026-10-30",
    "Post TI": "2026-10-28",
    "Post 3000": "2026-10-26",
    "Pazy by Pazy": "2026-10-23",
    "Corte Pazy by Pazy": "2026-10-16"
  };

  const INITIAL_NOTE = `Conteúdos Pazy Outubro

Cartinhas programadas até dia 06/11
Frases programadas até dia 28/10
Carrosséis Insta programadas até dia 26/10
O que eu diria programados até dia 28/10
Carrosséis LinkedIn programados até dia 30/10
Olho no Olho programados até dia 26/10
Post TI programadas até dia 28/10
Post 3000 programados até dia 26/10
Carrossel Substack programado até dia 27/10
Pazy by Pazy programados até dia 23/10
Cortes Pazy by Pazy 16/10
Papo Com A Pazy Programados até dia`;

  /* =========================================================
     ESTADO
  ========================================================= */

  const state = loadState();

  function loadState() {
    /*
     * Sempre começa sem marcações antigas.
     *
     * Isso resolve o problema de coisas que estavam marcadas
     * nas versões anteriores do sistema.
     */

    const defaultState = {
      currentWeek: getMonday(new Date()),

      // SOMENTE marcações manuais.
      manualDone: {},

      extras: {},

      programmedUntil: {
        ...INITIAL_PROGRAMMED_UNTIL
      },

      planningNote: INITIAL_NOTE
    };

    try {
      /*
       * Primeiro tenta carregar a nova versão.
       */
      const current = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (current) {
        return {
          currentWeek: current.currentWeek
            ? new Date(`${current.currentWeek}T12:00:00`)
            : getMonday(new Date()),

          manualDone: current.manualDone || {},

          extras: current.extras || {},

          programmedUntil: {
            ...INITIAL_PROGRAMMED_UNTIL,
            ...(current.programmedUntil || {})
          },

          planningNote:
            current.planningNote || INITIAL_NOTE
        };
      }

      /*
       * Aproveita as informações das versões antigas,
       * mas NÃO aproveita as antigas marcações.
       */
      const old = JSON.parse(
        localStorage.getItem(
          "pazy-content-planner-v4"
        ) || "null"
      );

      if (old) {
        return {
          currentWeek: old.currentWeek
            ? new Date(`${old.currentWeek}T12:00:00`)
            : getMonday(new Date()),

          // IMPORTANTE:
          // começamos zerado.
          manualDone: {},

          extras: old.extras || {},

          programmedUntil: {
            ...INITIAL_PROGRAMMED_UNTIL,
            ...(old.programmedUntil || {})
          },

          planningNote:
            old.planningNote || INITIAL_NOTE
        };
      }

      return defaultState;

    } catch {
      return defaultState;
    }
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

    return (
      `${formatBR(start)} — ${formatBR(end)}`
    );
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
     LIGAÇÃO ENTRE TAREFA E PROGRAMAÇÃO
  ========================================================= */

  function getPlanningKey(taskName) {
    const normalized =
      normalizeText(taskName);

    /*
     * CARTINHA
     */
    if (
      normalized === "cartinha" ||
      normalized === "story cartinha"
    ) {
      return "Cartinha";
    }

    /*
     * FRASES
     */
    if (
      normalized === "frase" ||
      normalized === "frases"
    ) {
      return "Frase";
    }

    /*
     * CARROSSÉIS
     */
    if (
      normalized === "carrossel"
    ) {
      return "Carrossel";
    }

    if (
      normalized ===
      "carrossel artigo"
    ) {
      return "Carrossel Artigo";
    }

    if (
      normalized ===
      "carrossel linkedin"
    ) {
      return "Carrossel LinkedIn";
    }

    /*
     * ARTIGO
     */
    if (
      normalized ===
      "artigo" ||
      normalized ===
      "story artigo com link"
    ) {
      return "Artigo";
    }

    /*
     * PAZY
     */
    if (
      normalized ===
      "pazy by pazy" ||
      normalized ===
      "story pazy by pazy"
    ) {
      return "Pazy by Pazy";
    }

    if (
      normalized ===
      "corte pazy by pazy"
    ) {
      return "Corte Pazy by Pazy";
    }

    /*
     * LINKEDIN
     */
    if (
      normalized ===
      "post ti"
    ) {
      return "Post TI";
    }

    if (
      normalized ===
      "post 3000"
    ) {
      return "Post 3000";
    }

    /*
     * PODCAST
     */
    if (
      normalized ===
      "story podcast"
    ) {
      return "Story Podcast";
    }

    if (
      normalized ===
      "corte podcast"
    ) {
      return "Corte Podcast";
    }

    if (
      normalized.includes(
        "video curto podcast"
      )
    ) {
      return "Vídeo Curto Podcast";
    }

    if (
      normalized.includes(
        "colocar link"
      )
    ) {
      return "Colocar link (caso tenha vídeo)";
    }

    /*
     * OUTROS
     */
    if (
      normalized ===
      "o que eu diria"
    ) {
      return "O que eu diria";
    }

    if (
      normalized ===
      "olho no olho"
    ) {
      return "Olho no Olho";
    }

    if (
      normalized ===
      "carrossel substack"
    ) {
      return "Carrossel Substack";
    }

    if (
      normalized ===
      "papo com a pazy"
    ) {
      return "Papo Com A Pazy";
    }

    return taskName;
  }

  function getProgrammedUntil(taskName) {
    const key =
      getPlanningKey(taskName);

    return (
      state.programmedUntil[key] ||
      null
    );
  }

  function isProgrammed(
    taskName,
    date
  ) {
    const limit =
      getProgrammedUntil(
        taskName
      );

    if (!limit) {
      return false;
    }

    return (
      formatDate(date) <= limit
    );
  }

  /* =========================================================
     CHECKBOX — 100% MANUAL
  ========================================================= */

  function getTaskId(
    date,
    platform,
    taskName
  ) {
    return [
      formatDate(date),
      platform,
      normalizeText(taskName)
    ].join("__");
  }

  function isDone(
    date,
    platform,
    taskName
  ) {
    return Boolean(
      state.manualDone[
        getTaskId(
          date,
          platform,
          taskName
        )
      ]
    );
  }

  function toggleTask(
    date,
    platform,
    taskName
  ) {
    const id =
      getTaskId(
        date,
        platform,
        taskName
      );

    /*
     * Clique 1:
     * marca.
     *
     * Clique 2:
     * desmarca.
     *
     * SEMPRE.
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

    if (!clean) {
      return;
    }

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

    if (!item) {
      return;
    }

    item.completed =
      !item.completed;

    saveState();

    render();
  }

  /* =========================================================
     TAREFAS DO DIA
  ========================================================= */

  function getTasksForDay(
    date
  ) {
    const weekday =
      date.getDay();

    return {
      instagramTikTok:
        ROUTINES
          .instagramTikTok[
            weekday
          ] || [],

      linkedin:
        ROUTINES
          .linkedin[
            weekday
          ] || []
    };
  }

  /* =========================================================
     VISUAL DE UMA TAREFA
  ========================================================= */

  function buildTaskHTML(
    date,
    platform,
    taskName
  ) {
    const done =
      isDone(
        date,
        platform,
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
              platform,
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

  function renderDay(
    date
  ) {
    const tasks =
      getTasksForDay(date);

    const today =
      isToday(date);

    let total = 0;
    let done = 0;

    Object.entries(tasks)
      .forEach(
        ([platform, list]) => {

          list.forEach(
            task => {

              total++;

              if (
                isDone(
                  date,
                  platform,
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
            (done / total) * 100
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

          <div
            class="platform-section"
          >

            <h3
              class="platform-title"
            >
              Instagram / TikTok
            </h3>

            <div
              class="task-list"
            >

              ${
                tasks
                  .instagramTikTok
                  .map(
                    task =>
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


          <div
            class="platform-section"
          >

            <h3
              class="platform-title"
            >
              LinkedIn
            </h3>

            <div
              class="task-list"
            >

              ${
                tasks.linkedin.length
                  ? tasks
                      .linkedin
                      .map(
                        task =>
                          buildTaskHTML(
                            date,
                            "linkedin",
                            task
                          )
                      )
                      .join("")
                  : `
                    <span
                      style="
                        color:#999;
                        font-size:12px;
                      "
                    >
                      —
                    </span>
                  `
              }

            </div>

          </div>


          <div
            class="day-progress"
          >

            <div
              class="progress-text"
            >

              <span>
                ${done}/${total}
                feitas
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
            formatLongDate(today)
          )}
        </p>


        <section
          class="today-section"
        >

          <h4
            class="today-section-title"
          >
            Instagram / TikTok
          </h4>

          <div
            class="task-list"
          >

            ${
              tasks
                .instagramTikTok
                .map(
                  task =>
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


        <section
          class="today-section"
        >

          <h4
            class="today-section-title"
          >
            LinkedIn
          </h4>

          <div
            class="task-list"
          >

            ${
              tasks
                .linkedin
                .map(
                  task =>
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
              tasks
            )}
          </div>

        </section>

      </aside>
    `;
  }

  function renderUnplannedToday(
    tasks
  ) {
    const list = [];

    Object.entries(tasks)
      .forEach(
        ([platform, taskList]) => {

          taskList.forEach(
            task => {

              if (
                !isProgrammed(
                  task,
                  getToday()
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
              getToday(),
              item.platform,
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
     
     SOMENTE O QUE FOI MARCADO MANUALMENTE
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

      Object.entries(tasks)
        .forEach(
          ([platform, list]) => {

            list.forEach(
              task => {

                total++;

                if (
                  isDone(
                    date,
                    platform,
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
            (done / total) * 100
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
      return "Carrossel LinkedIn";
    }

    if (
      normalized.includes(
        "carrosseis insta"
      ) ||
      normalized.includes(
        "carrossel insta"
      ) ||
      normalized.includes(
        "carrosseis instagram"
      )
    ) {
      return "Carrossel";
    }

    if (
      normalized.includes(
        "carrossel artigo"
      )
    ) {
      return "Carrossel Artigo";
    }

    if (
      normalized.includes(
        "carrossel substack"
      )
    ) {
      return "Carrossel Substack";
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
        "frase"
      )
    ) {
      return "Frase";
    }

    if (
      normalized.includes(
        "post ti"
      )
    ) {
      return "Post TI";
    }

    if (
      normalized.includes(
        "post 3000"
      )
    ) {
      return "Post 3000";
    }

    if (
      normalized.includes(
        "cortes pazy by pazy"
      ) ||
      normalized.includes(
        "corte pazy by pazy"
      )
    ) {
      return "Corte Pazy by Pazy";
    }

    /*
     * IMPORTANTE:
     * "Cortes Pazy by Pazy" precisa ser testado
     * antes de "Pazy by Pazy".
     */

    if (
      normalized.includes(
        "pazy by pazy"
      )
    ) {
      return "Pazy by Pazy";
    }

    if (
      normalized.includes(
        "olho no olho"
      )
    ) {
      return "Olho no Olho";
    }

    if (
      normalized.includes(
        "o que eu diria"
      )
    ) {
      return "O que eu diria";
    }

    if (
      normalized.includes(
        "papo com a pazy"
      )
    ) {
      return "Papo Com A Pazy";
    }

    if (
      normalized.includes(
        "story podcast"
      )
    ) {
      return "Story Podcast";
    }

    if (
      normalized.includes(
        "corte podcast"
      )
    ) {
      return "Corte Podcast";
    }

    if (
      normalized.includes(
        "video curto podcast"
      )
    ) {
      return "Vídeo Curto Podcast";
    }

    if (
      normalized.includes(
        "colocar link"
      )
    ) {
      return "Colocar link (caso tenha vídeo)";
    }

    if (
      normalized ===
        "artigo" ||
      normalized.startsWith(
        "artigo "
      )
    ) {
      return "Artigo";
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

        const planningKey =
          detectPlanningKey(
            normalized
          );

        if (!planningKey) {
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

        const isoDate =
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
          planningKey
        ] = isoDate;

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
            Quando quiser atualizar o planejamento,
            escreva o conteúdo e a data.
            Exemplo:
            “Cartinhas programadas até 13/11”.
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

    /*
     * SEMANA ANTERIOR
     */

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


    /*
     * PRÓXIMA SEMANA
     */

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


    /*
     * HOJE
     */

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


    /*
     * ABRIR NOTES
     */

    document
      .getElementById(
        "update-content-button"
      )
      ?.addEventListener(
        "click",
        openUpdateModal
      );


    /*
     * FECHAR NOTES
     */

    document
      .getElementById(
        "close-modal"
      )
      ?.addEventListener(
        "click",
        closeUpdateModal
      );


    /*
     * SALVAR NOTES AUTOMATICAMENTE
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
     * SALVAR NOTES
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
     * APLICAR PLANEJAMENTO
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

          if (changes > 0) {

            alert(
              `${changes} programação(ões) atualizada(s).`
            );

          } else {

            alert(
              "Não encontrei nenhuma linha com conteúdo e data."
            );

          }

        }
      );


    /*
     * CHECKBOXES
     *
     * TODAS MANUAIS.
     *
     * Clicar marca.
     * Clicar novamente desmarca.
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

              const platform =
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
                platform,
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
     * NOVA TAREFA EXTRA
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

          if (!input) {
            return;
          }

          addExtra(
            getToday(),
            input.value
          );

        }
      );


    /*
     * ENTER NA TAREFA EXTRA
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
     INICIALIZAÇÃO
  ========================================================= */

  saveState();

  render();

})();
