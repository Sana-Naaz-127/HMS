/* Careline HMS – frontend. Authentication and Doctors use the Express/MongoDB backend. Other modules are being migrated incrementally. */

const $ = s => document.querySelector(s);

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

const addD = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const T = addD(0);
const money = n => '₹' + Number(n).toLocaleString('en-IN');


/* =========================================================
   BACKEND API
========================================================= */

const API = 'http://localhost:5000/api';

let token = localStorage.getItem('careline_token') || '';


async function apiFetch(path, options = {}) {

  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers
  });

  let data = {};

  try {
    data = await res.json();
  } catch (_) {}

  if (res.status === 401) {

    token = '';

    localStorage.removeItem('careline_token');
    localStorage.removeItem('careline_user');

    me = null;

    clearTimeout(idle);

    if ($('#app')) {
      $('#app').hidden = true;
    }

    if ($('#login')) {
      $('#login').hidden = false;
    }

    throw new Error(
      data.message || 'Session expired. Please log in again.'
    );
  }

  if (!res.ok) {
    throw new Error(
      data.message || `Request failed (${res.status})`
    );
  }

  return data;
}


/* =========================================================
   LOAD DOCTORS FROM MONGODB
========================================================= */

async function loadDoctors() {

  const data = await apiFetch('/doctors');

  DB.doctors = (data.doctors || []).map(d => ({
    id: d.doctorId,
    name: d.name,
    dept: d.dept,
    fee: d.fee,
    days: d.days || [],
    start: d.start,
    end: d.end,
    leave: d.leave || []
  }));
}


/* =========================================================
   RESTORE LOGIN SESSION
========================================================= */

async function loadSession() {

  if (!token) {
    return;
  }

  try {

    const data = await apiFetch('/auth/me');

    me = data.user;

    view = 'dashboard';

    st = {
      page: 1,
      q: ''
    };

    $('#login').hidden = true;
    $('#app').hidden = false;

    render();

    resetIdle();

  } catch (_) {

    token = '';

  }
}


/* =========================================================
   TEMPORARY MOCK DATA
   Other modules will be migrated to MongoDB later.
========================================================= */

const names = [
  'Rahul Roy',
  'Anita Ghosh',
  'Sourav Das',
  'Meera Nair',
  'Imran Ali',
  'Priya Basu',
  'Arjun Mehta',
  'Kavita Rao',
  'Dev Sharma',
  'Sunita Paul',
  'Vikram Sethi',
  'Neha Jain'
];


const DB = {

  users: [
    {
      u: 'admin',
      p: 'demo123',
      role: 'admin',
      name: 'Admin Root'
    },

    {
      u: 'drsen',
      p: 'demo123',
      role: 'doctor',
      name: 'Dr. A. Sen',
      did: 1
    },

    {
      u: 'reception',
      p: 'demo123',
      role: 'reception',
      name: 'Riya Das'
    },

    {
      u: 'patient',
      p: 'demo123',
      role: 'patient',
      name: 'Rahul Roy',
      pid: 'P1001'
    }
  ],


  doctors: [

    {
      id: 1,
      name: 'Dr. A. Sen',
      dept: 'Cardiology',
      fee: 800,
      days: [1, 2, 3, 4, 5],
      start: 9,
      end: 13,
      leave: []
    },

    {
      id: 2,
      name: 'Dr. M. Khan',
      dept: 'Orthopedics',
      fee: 600,
      days: [1, 3, 5],
      start: 10,
      end: 16,
      leave: []
    },

    {
      id: 3,
      name: 'Dr. P. Iyer',
      dept: 'Pediatrics',
      fee: 500,
      days: [0, 2, 4, 6],
      start: 9,
      end: 14,
      leave: []
    }

  ],


  patients: names.map((n, i) => ({
    id: 'P' + (1001 + i),
    n,
    age: 20 + i * 4,
    g: i % 2 ? 'F' : 'M',
    phone: '98300' + String(10000 + i * 137).slice(-5),
    bg: ['A+', 'B+', 'O+', 'AB+'][i % 4],
    allergy: i % 3 ? 'None' : 'Penicillin',
    emg: '9000000000',
    active: true
  })),


  appts: [

    {
      id: 1,
      pid: 'P1001',
      did: 1,
      date: T,
      time: '09:00',
      status: 'Confirmed'
    },

    {
      id: 2,
      pid: 'P1002',
      did: 1,
      date: T,
      time: '09:30',
      status: 'Scheduled'
    },

    {
      id: 3,
      pid: 'P1003',
      did: 2,
      date: addD(-2),
      time: '10:00',
      status: 'Completed'
    },

    {
      id: 4,
      pid: 'P1001',
      did: 3,
      date: addD(-1),
      time: '11:00',
      status: 'Completed'
    },

    {
      id: 5,
      pid: 'P1004',
      did: 1,
      date: addD(1),
      time: '10:00',
      status: 'Scheduled'
    }

  ],


  records: [

    {
      id: 1,
      pid: 'P1001',
      did: 1,
      date: addD(-20),
      dx: 'Mild hypertension',
      rx: 'Amlodipine 5mg, once daily for 30 days',
      notes: 'Review BP in 4 weeks.'
    }

  ],


  bills: [

    {
      id: 1,
      pid: 'P1001',
      date: addD(-1),
      items: [
        {
          n: 'Consultation',
          a: 500
        },
        {
          n: 'Lab',
          a: 350
        }
      ],
      paid: 850
    },

    {
      id: 2,
      pid: 'P1003',
      date: addD(-2),
      items: [
        {
          n: 'Consultation',
          a: 600
        },
        {
          n: 'Medicine',
          a: 420
        },
        {
          n: 'Room/service',
          a: 1000
        }
      ],
      paid: 500
    }

  ],


  notes: [
    {
      t: 'Appointment confirmed for today 09:00',
      pid: 'P1001'
    },

    {
      t: 'Low stock: Amoxicillin 250mg',
      role: 'admin'
    }
  ],


  audit: []

};


let me = null;

let view = 'dashboard';

let st = {
  page: 1,
  q: ''
};

let idle;


/* =========================================================
   NAVIGATION
========================================================= */

const NAV = {

  admin: [
    'dashboard',
    'patients',
    'doctors',
    'appointments',
    'records',
    'billing',
    'audit'
  ],

  doctor: [
    'dashboard',
    'patients',
    'appointments',
    'records'
  ],

  reception: [
    'dashboard',
    'patients',
    'doctors',
    'appointments',
    'billing'
  ],

  patient: [
    'dashboard',
    'appointments',
    'records',
    'billing'
  ]

};


const label = v =>
  v[0].toUpperCase() + v.slice(1);


const pName = id =>
  DB.patients.find(p => p.id === id)?.n || id;


const dName = id =>
  DB.doctors.find(d => d.id === id)?.name || id;


const staff = () =>
  me.role === 'admin' || me.role === 'reception';


const can = v =>
  NAV[me.role].includes(v);


const log = what =>
  DB.audit.unshift({
    at: new Date().toLocaleString(),
    who: me.name,
    what
  });


const toast = m => {

  const t = $('#toast');

  t.textContent = m;

  t.className = 'show';

  setTimeout(() => {
    t.className = '';
  }, 2200);

};


const chip = s =>
  `<span class="chip ${
    ['Completed', 'Paid', 'Confirmed'].includes(s)
      ? 'ok'
      : ['Cancelled', 'No-show', 'Pending'].includes(s)
        ? 'warn'
        : ''
  }">${esc(s)}</span>`;


const empty = m =>
  `<div class="empty">${m}</div>`;


/* =========================================================
   ROLE-SCOPED DATA
========================================================= */

const myAppts = () =>
  DB.appts.filter(a =>
    me.role === 'patient'
      ? a.pid === me.pid
      : me.role === 'doctor'
        ? a.did === me.did
        : true
  );


const myRecs = () =>
  DB.records.filter(r =>
    me.role === 'patient'
      ? r.pid === me.pid
      : me.role === 'doctor'
        ? r.did === me.did
        : true
  );


const myBills = () =>
  DB.bills.filter(b =>
    me.role === 'patient'
      ? b.pid === me.pid
      : true
  );


const total = b =>
  b.items.reduce((s, i) => s + i.a, 0);


const bstat = b =>
  b.paid >= total(b)
    ? 'Paid'
    : b.paid > 0
      ? 'Partially Paid'
      : 'Pending';


/* =========================================================
   APPOINTMENT SLOT AVAILABILITY
========================================================= */

function slots(did, date) {

  const d = DB.doctors.find(x => x.id == did);

  if (
    !d ||
    !date ||
    d.leave.includes(date) ||
    !d.days.includes(
      new Date(date + 'T00:00').getDay()
    )
  ) {
    return [];
  }

  const taken = DB.appts
    .filter(a =>
      a.did == did &&
      a.date === date &&
      !['Cancelled', 'No-show'].includes(a.status)
    )
    .map(a => a.time);

  const out = [];

  for (
    let h = d.start;
    h < d.end;
    h += .5
  ) {

    const t =
      String(Math.floor(h)).padStart(2, '0') +
      (h % 1 ? ':30' : ':00');

    if (!taken.includes(t)) {
      out.push(t);
    }

  }

  return out;
}


/* =========================================================
   MODAL + FORM HELPERS
========================================================= */

function modal(
  title,
  body,
  onSubmit,
  submitLabel = 'Save'
) {

  $('#mTitle').textContent = title;

  $('#mBody').innerHTML = onSubmit

    ? `
      <form class="f" id="mf" novalidate>
        ${body}

        <p
          class="err full"
          id="mErr"
          role="alert">
        </p>

        <div class="row full">

          <button class="btn">
            ${submitLabel}
          </button>

          <button
            type="button"
            class="btn ghost"
            data-a="close">
            Cancel
          </button>

        </div>

      </form>
      `

    : body +
      `
      <div
        class="row"
        style="margin-top:1rem">

        <button
          class="btn ghost"
          data-a="close">
          Close
        </button>

      </div>
      `;

  $('#modal').hidden = false;


  if (onSubmit) {

    $('#mf').onsubmit = async e => {

      e.preventDefault();

      const submit =
        e.target.querySelector(
          'button[type="submit"]'
        ) ||
        e.target.querySelector(
          '.btn:not(.ghost)'
        );

      if (submit) {
        submit.disabled = true;
      }

      try {

        const err =
          await onSubmit(
            Object.fromEntries(
              new FormData(e.target)
            )
          );

        if (err) {

          $('#mErr').textContent = err;

          if (submit) {
            submit.disabled = false;
          }

        } else {

          $('#modal').hidden = true;

          render();

        }

      } catch (error) {

        $('#mErr').textContent =
          error.message ||
          'Something went wrong.';

        if (submit) {
          submit.disabled = false;
        }

      }

    };

  }

}


const fld = (
  n,
  l,
  v = '',
  type = 'text',
  extra = ''
) =>
  `<label>
    ${l}
    <input
      name="${n}"
      type="${type}"
      value="${esc(v)}"
      ${extra}>
  </label>`;


const sel = (
  n,
  l,
  opts,
  v = '',
  extra = ''
) =>
  `<label>
    ${l}
    <select name="${n}" ${extra}>
      ${opts.map(o => {

        const [
          val,
          t
        ] = Array.isArray(o)
          ? o
          : [o, o];

        return `
          <option
            value="${esc(val)}"
            ${val == v ? 'selected' : ''}>
            ${esc(t)}
          </option>
        `;

      }).join('')}
    </select>
  </label>`;


const patOpts = () =>
  [
    ['', 'Select patient']
  ].concat(
    DB.patients
      .filter(p => p.active)
      .map(p => [
        p.id,
        `${p.n} (${p.id})`
      ])
  );


/* =========================================================
   VIEWS
========================================================= */

const V = {


  /* =========================
     DASHBOARD
  ========================= */

  dashboard() {

    const a = myAppts();

    const todays =
      a
        .filter(x => x.date === T)
        .sort((x, y) =>
          x.time.localeCompare(y.time)
        );

    const rev =
      DB.bills.reduce(
        (s, b) => s + b.paid,
        0
      );

    const days =
      [...Array(7)].map((_, i) => {

        const d = addD(i - 3);

        return [
          d.slice(5),
          a.filter(x => x.date === d).length
        ];

      });

    const mx =
      Math.max(
        1,
        ...days.map(d => d[1])
      );


    const stats =
      me.role === 'patient'

        ? [
            [
              'Upcoming appointments',
              a.filter(x =>
                x.date >= T &&
                ![
                  'Cancelled',
                  'Completed'
                ].includes(x.status)
              ).length
            ],

            [
              'Medical records',
              myRecs().length
            ],

            [
              'Bills due',
              myBills().filter(
                b => bstat(b) !== 'Paid'
              ).length
            ]
          ]

        : me.role === 'doctor'

          ? [
              [
                "Today's queue",
                todays.length
              ],

              [
                'My patients',
                new Set(
                  a.map(x => x.pid)
                ).size
              ],

              [
                'Records written',
                myRecs().length
              ]
            ]

          : [
              [
                'Active patients',
                DB.patients.filter(
                  p => p.active
                ).length
              ],

              [
                "Today's appointments",
                todays.length
              ],

              [
                'Revenue collected',
                money(rev)
              ],

              [
                'Doctors',
                DB.doctors.length
              ]
            ];


    return `

      <h2>Dashboard</h2>

      <div class="grid">

        ${stats.map(s => `
          <div class="card stat">
            <b>${s[1]}</b>
            ${s[0]}
          </div>
        `).join('')}

      </div>


      <div
        class="card"
        style="margin-bottom:1rem">

        <h3>
          Appointments, last 3 days to next 3
        </h3>

        <div class="bars">

          ${days.map(d => `
            <div>

              ${d[1]}

              <i
                style="height:${d[1] / mx * 85}%">
              </i>

              ${d[0]}

            </div>
          `).join('')}

        </div>

      </div>


      <div class="card">

        <h3>
          ${
            me.role === 'doctor'
              ? "Today's queue"
              : 'Today'
          }
        </h3>

        ${
          todays.length

            ? `
              <div class="wrap">

                <table>

                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>

                  ${todays.map(x => `

                    <tr>

                      <td>
                        ${x.time}
                      </td>

                      <td>
                        ${esc(pName(x.pid))}
                      </td>

                      <td>
                        ${esc(dName(x.did))}
                      </td>

                      <td>
                        ${chip(x.status)}
                      </td>

                    </tr>

                  `).join('')}

                </table>

              </div>
            `

            : empty(
              'No appointments today.'
            )
        }

      </div>

    `;
  },


  /* =========================
     PATIENTS
  ========================= */

  patients() {

    const q =
      st.q.toLowerCase();

    const size = 5;

    let list =
      DB.patients.filter(p =>
        !q ||
        [
          p.n,
          p.id,
          p.phone
        ].some(v =>
          v.toLowerCase()
            .includes(q)
        )
      );


    if (me.role === 'doctor') {

      const ids =
        new Set(
          DB.appts
            .filter(a =>
              a.did === me.did
            )
            .map(a => a.pid)
        );

      list =
        list.filter(
          p => ids.has(p.id)
        );

    }


    const pages =
      Math.max(
        1,
        Math.ceil(
          list.length / size
        )
      );


    st.page =
      Math.min(
        st.page,
        pages
      );


    const rows =
      list.slice(
        (st.page - 1) * size,
        st.page * size
      );


    return `

      <div class="row space">

        <h2>Patients</h2>

        ${
          staff()
            ? `
              <button
                class="btn"
                data-a="editPatient">
                Register patient
              </button>
            `
            : ''
        }

      </div>


      <div class="bar">

        <input
          id="q"
          placeholder="Search name, ID or phone"
          value="${esc(st.q)}"
          aria-label="Search patients">

      </div>


      <div class="card wrap">

        ${
          rows.length

            ? `

              <table>

                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age/Sex</th>
                  <th>Phone</th>
                  <th>Blood</th>
                  <th>Status</th>
                  <th></th>
                </tr>

                ${rows.map(p => `

                  <tr>

                    <td>
                      ${p.id}
                    </td>

                    <td>
                      ${esc(p.n)}
                    </td>

                    <td>
                      ${p.age}/${p.g}
                    </td>

                    <td>
                      ${p.phone}
                    </td>

                    <td>
                      ${p.bg}
                    </td>

                    <td>
                      ${chip(
                        p.active
                          ? 'Active'
                          : 'Inactive'
                      )}
                    </td>

                    <td class="row">

                      <button
                        class="btn sm ghost"
                        data-a="profile"
                        data-id="${p.id}">
                        Profile
                      </button>

                      ${
                        staff()
                          ? `

                            <button
                              class="btn sm ghost"
                              data-a="editPatient"
                              data-id="${p.id}">
                              Edit
                            </button>

                            <button
                              class="btn sm danger"
                              data-a="togglePatient"
                              data-id="${p.id}">
                              ${
                                p.active
                                  ? 'Deactivate'
                                  : 'Reactivate'
                              }
                            </button>

                          `
                          : ''
                      }

                    </td>

                  </tr>

                `).join('')}

              </table>

            `

            : empty(
              'No patients match your search.'
            )
        }

      </div>


      <div
        class="row space"
        style="margin-top:.75rem">

        <span class="muted small">

          Page ${st.page}
          of ${pages}
          · ${list.length} patients

        </span>


        <div class="row">

          <button
            class="btn sm ghost"
            data-a="page"
            data-id="-1"
            ${st.page < 2 ? 'disabled' : ''}>
            Previous
          </button>

          <button
            class="btn sm ghost"
            data-a="page"
            data-id="1"
            ${st.page >= pages ? 'disabled' : ''}>
            Next
          </button>

        </div>

      </div>

    `;
  },


  /* =========================
     DOCTORS
  ========================= */

  doctors() {

    const depts =
      [
        ...new Set(
          DB.doctors.map(
            d => d.dept
          )
        )
      ];

    const dn = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat'
    ];


    if (!DB.doctors.length) {

      return `
        <h2>Doctors</h2>
        ${empty('No doctors found.')}
      `;

    }


    return `

      <h2>Doctors</h2>

      ${depts.map(dp => `

        <h3
          style="margin-top:1rem">
          ${esc(dp)}
        </h3>

        <div class="grid">

          ${
            DB.doctors
              .filter(
                d => d.dept === dp
              )
              .map(d => `

                <div class="card">

                  <b>
                    ${esc(d.name)}
                  </b>

                  <div
                    class="muted small">
                    Fee ${money(d.fee)}
                  </div>

                  <p class="small">

                    ${d.days
                      .map(x => dn[x])
                      .join(', ')}

                    <br>

                    ${d.start}:00 –
                    ${d.end}:00

                  </p>

                  ${
                    d.leave.length

                      ? `
                        <p class="small">
                          On leave:
                          ${d.leave.join(', ')}
                        </p>
                      `

                      : ''
                  }

                  ${
                    me.role === 'admin'

                      ? `
                        <button
                          class="btn sm ghost"
                          data-a="leave"
                          data-id="${d.id}">
                          Mark leave
                        </button>
                      `

                      : ''
                  }

                </div>

              `)
              .join('')
          }

        </div>

      `).join('')}

    `;
  },


  /* =========================
     APPOINTMENTS
  ========================= */

  appointments() {

    const list =
      myAppts().sort(
        (a, b) =>
          (a.date + a.time)
            .localeCompare(
              b.date + b.time
            )
      );


    return `

      <div class="row space">

        <h2>
          Appointments
        </h2>

        ${
          me.role !== 'doctor'

            ? `
              <button
                class="btn"
                data-a="book">
                Book appointment
              </button>
            `

            : ''
        }

      </div>


      <div class="card wrap">

        ${
          list.length

            ? `

              <table>

                <tr>
                  <th>When</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th></th>
                </tr>

                ${list.map(a => {

                  const open =
                    ![
                      'Cancelled',
                      'Completed',
                      'No-show'
                    ].includes(
                      a.status
                    );


                  return `

                    <tr>

                      <td>
                        ${a.date}
                        ${a.time}
                      </td>

                      <td>
                        ${esc(
                          pName(a.pid)
                        )}
                      </td>

                      <td>
                        ${esc(
                          dName(a.did)
                        )}
                      </td>

                      <td>

                        ${chip(a.status)}

                        ${
                          a.reason
                            ? `
                              <span
                                class="muted small">
                                ${esc(a.reason)}
                              </span>
                            `
                            : ''
                        }

                      </td>

                      <td class="row">

                        ${
                          open &&
                          me.role !== 'patient'

                            ? `

                              <button
                                class="btn sm ghost"
                                data-a="status"
                                data-id="${a.id}|Confirmed">
                                Confirm
                              </button>

                              <button
                                class="btn sm ghost"
                                data-a="status"
                                data-id="${a.id}|Completed">
                                Complete
                              </button>

                              <button
                                class="btn sm ghost"
                                data-a="status"
                                data-id="${a.id}|No-show">
                                No-show
                              </button>

                            `

                            : ''
                        }


                        ${
                          open &&
                          me.role !== 'doctor'

                            ? `

                              <button
                                class="btn sm danger"
                                data-a="cancel"
                                data-id="${a.id}">
                                Cancel
                              </button>

                            `

                            : ''
                        }

                      </td>

                    </tr>

                  `;

                }).join('')}

              </table>

            `

            : empty(
              'No appointments yet. Book one to get started.'
            )
        }

      </div>

    `;
  },


  /* =========================
     MEDICAL RECORDS
  ========================= */

  records() {

    const list =
      myRecs().sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );


    return `

      <div class="row space">

        <h2>
          Medical records
        </h2>

        ${
          me.role === 'doctor' ||
          me.role === 'admin'

            ? `
              <button
                class="btn"
                data-a="newRec">
                Add record
              </button>
            `

            : ''
        }

      </div>


      ${
        list.length

          ? list.map(r => `

              <div
                class="card"
                style="margin-bottom:.75rem">

                <div class="row space">

                  <b>
                    ${esc(
                      pName(r.pid)
                    )}
                  </b>

                  <span
                    class="muted small">

                    ${r.date}
                    ·
                    ${esc(
                      dName(r.did)
                    )}

                  </span>

                </div>


                <p>

                  <b>Diagnosis:</b>
                  ${esc(r.dx)}

                  <br>

                  <b>Prescription:</b>
                  ${esc(r.rx)}

                  <br>

                  <b>Notes:</b>
                  ${esc(
                    r.notes || '—'
                  )}

                </p>


                <button
                  class="btn sm ghost"
                  data-a="rxPrint"
                  data-id="${r.id}">
                  Print prescription
                </button>

              </div>

            `).join('')

          : empty(
              'No medical records to show.'
            )
      }

    `;
  },


  /* =========================
     BILLING
  ========================= */

  billing() {

    const list =
      myBills();


    return `

      <div class="row space">

        <h2>
          Billing
        </h2>

        ${
          staff()

            ? `
              <button
                class="btn"
                data-a="newBill">
                Create bill
              </button>
            `

            : ''
        }

      </div>


      <div class="card wrap">

        ${
          list.length

            ? `

              <table>

                <tr>
                  <th>Invoice</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th></th>
                </tr>

                ${list.map(b => `

                  <tr>

                    <td>
                      INV-${1000 + b.id}
                    </td>

                    <td>
                      ${esc(
                        pName(b.pid)
                      )}
                    </td>

                    <td>
                      ${b.date}
                    </td>

                    <td>
                      ${money(
                        total(b)
                      )}
                    </td>

                    <td>
                      ${money(
                        b.paid
                      )}
                    </td>

                    <td>
                      ${chip(
                        bstat(b)
                      )}
                    </td>

                    <td class="row">

                      <button
                        class="btn sm ghost"
                        data-a="invoice"
                        data-id="${b.id}">
                        Invoice
                      </button>

                      ${
                        staff() &&
                        bstat(b) !== 'Paid'

                          ? `
                            <button
                              class="btn sm ghost"
                              data-a="pay"
                              data-id="${b.id}">
                              Record payment
                            </button>
                          `

                          : ''
                      }

                    </td>

                  </tr>

                `).join('')}

              </table>

            `

            : empty(
              'No bills found.'
            )
        }

      </div>

    `;
  },


  /* =========================
     AUDIT
  ========================= */

  audit() {

    return `

      <h2>
        Audit log
      </h2>

      <div class="card wrap">

        ${
          DB.audit.length

            ? `

              <table>

                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>What</th>
                </tr>

                ${DB.audit.map(a => `

                  <tr>

                    <td>
                      ${esc(a.at)}
                    </td>

                    <td>
                      ${esc(a.who)}
                    </td>

                    <td>
                      ${esc(a.what)}
                    </td>

                  </tr>

                `).join('')}

              </table>

            `

            : empty(
                'Nothing logged yet. Changes to patients, records and bills appear here.'
              )
        }

      </div>

    `;
  }

};


/* =========================================================
   ACTIONS
========================================================= */

const A = {


  close() {

    $('#modal').hidden = true;

  },


  /* =========================
     LOGOUT
  ========================= */

  logout() {

    me = null;

    token = '';

    localStorage.removeItem(
      'careline_token'
    );

    localStorage.removeItem(
      'careline_user'
    );

    clearTimeout(idle);

    $('#app').hidden = true;

    $('#login').hidden = false;

    $('#loginForm').reset();

  },


  page(d) {

    st.page += +d;

    render();

  },


  /* =========================
     NOTIFICATIONS
  ========================= */

  bell() {

    const n =
      DB.notes.filter(x =>
        (!x.pid || x.pid === me.pid) &&
        (!x.role || x.role === me.role)
      );


    modal(
      'Notifications',

      n.length

        ? n
            .map(x =>
              `<p>${esc(x.t)}</p>`
            )
            .join('')

        : empty(
            'You are all caught up.'
          )
    );

  },


  /* =========================
     PATIENT FORM
  ========================= */

  editPatient(id) {

    const p =
      DB.patients.find(
        x => x.id === id
      ) || {};


    modal(

      id
        ? 'Edit patient'
        : 'Register patient',

      fld(
        'n',
        'Full name',
        p.n,
        'text',
        'required'
      )

      +

      fld(
        'age',
        'Age',
        p.age,
        'number',
        'min=0 max=120'
      )

      +

      sel(
        'g',
        'Gender',
        [
          'M',
          'F',
          'Other'
        ],
        p.g
      )

      +

      fld(
        'phone',
        'Phone (10 digits)',
        p.phone
      )

      +

      sel(
        'bg',
        'Blood group',
        [
          'A+',
          'A-',
          'B+',
          'B-',
          'O+',
          'O-',
          'AB+',
          'AB-'
        ],
        p.bg
      )

      +

      fld(
        'emg',
        'Emergency contact',
        p.emg
      )

      +

      `
        <div class="full">
          ${fld(
            'allergy',
            'Allergies',
            p.allergy
          )}
        </div>
      `,

      f => {

        if (
          f.n.trim().length < 2
        ) {
          return 'Enter the patient’s full name.';
        }


        if (
          !(
            f.age >= 0 &&
            f.age <= 120 &&
            f.age !== ''
          )
        ) {
          return 'Age must be between 0 and 120.';
        }


        if (
          !/^\d{10}$/.test(
            f.phone
          )
        ) {
          return 'Phone must be exactly 10 digits.';
        }


        if (id) {

          Object.assign(
            p,
            f,
            {
              n: f.n.trim(),
              age: +f.age
            }
          );

          log(
            `Updated patient ${id}`
          );

        } else {

          const nid =
            'P' +
            (
              1001 +
              DB.patients.length
            );

          DB.patients.push({

            ...f,

            id: nid,

            n: f.n.trim(),

            age: +f.age,

            active: true

          });

          log(
            `Registered patient ${nid}`
          );

        }


        toast(
          'Patient saved'
        );

      }

    );

  },


  /* =========================
     PATIENT STATUS
  ========================= */

  togglePatient(id) {

    const p =
      DB.patients.find(
        x => x.id === id
      );

    p.active =
      !p.active;

    log(
      `${
        p.active
          ? 'Reactivated'
          : 'Deactivated'
      } patient ${id}`
    );

    render();

  },


  /* =========================
     PATIENT PROFILE
  ========================= */

  profile(id) {

    const p =
      DB.patients.find(
        x => x.id === id
      );

    const ap =
      DB.appts.filter(
        a => a.pid === id
      );

    const rc =
      DB.records.filter(
        r => r.pid === id
      );

    const bl =
      DB.bills.filter(
        b => b.pid === id
      );


    modal(

      p.n,

      `

      <p class="muted">

        ${p.id}
        ·
        ${p.age}/${p.g}
        ·
        ${p.bg}
        ·
        ${p.phone}

        <br>

        Allergies:
        ${esc(p.allergy)}

        ·

        Emergency:
        ${esc(p.emg)}

      </p>


      <h3>
        Visits
      </h3>

      ${
        ap.length

          ? ap.map(a => `
              <div class="small">

                ${a.date}
                ${a.time}

                ·

                ${esc(
                  dName(a.did)
                )}

                ${chip(
                  a.status
                )}

              </div>
            `).join('')

          : `
            <p class="muted small">
              None
            </p>
          `
      }


      <h3
        style="margin-top:.75rem">

        Records

      </h3>

      ${
        rc.length

          ? rc.map(r => `
              <div class="small">

                ${r.date}
                ·
                ${esc(r.dx)}

              </div>
            `).join('')

          : `
            <p class="muted small">
              None
            </p>
          `
      }


      <h3
        style="margin-top:.75rem">

        Billing

      </h3>

      ${
        bl.length

          ? bl.map(b => `
              <div class="small">

                INV-${1000 + b.id}

                ·

                ${money(
                  total(b)
                )}

                ${chip(
                  bstat(b)
                )}

              </div>
            `).join('')

          : `
            <p class="muted small">
              None
            </p>
          `
      }

      `

    );

  },


  /* =========================
     DOCTOR LEAVE - REAL API
  ========================= */

  leave(id) {

    modal(

      'Mark doctor on leave',

      fld(
        'd',
        'Date',
        '',
        'date',
        'required'
      ),

      async f => {

        if (!f.d) {
          return 'Pick a date.';
        }


        try {

          const data =
            await apiFetch(
              `/doctors/${id}/leave`,
              {
                method: 'POST',

                body: JSON.stringify({
                  date: f.d
                })
              }
            );


          const d =
            DB.doctors.find(
              x => x.id == id
            );


          if (d) {

            d.leave =
              data.doctor?.leave ||
              [
                ...(d.leave || []),
                f.d
              ];

          }


          log(
            `Marked ${
              d?.name ||
              `doctor ${id}`
            } on leave ${f.d}`
          );


          toast(
            'Leave saved'
          );


          return '';

        } catch (error) {

          return error.message;

        }

      }

    );

  },


  /* =========================
     BOOK APPOINTMENT
     Still local for now
  ========================= */

  book() {

    const fixed =
      me.role === 'patient';


    modal(

      'Book appointment',

      (

        fixed

          ? `
            <input
              type="hidden"
              name="pid"
              value="${me.pid}">
          `

          : `
            <div class="full">

              ${sel(
                'pid',
                'Patient',
                patOpts()
              )}

            </div>
          `

      )

      +

      sel(
        'did',
        'Doctor',

        [
          [
            '',
            'Select doctor'
          ]
        ].concat(
          DB.doctors.map(d => [
            d.id,
            `${d.name} – ${d.dept}`
          ])
        )
      )

      +

      fld(
        'date',
        'Date',
        '',
        'date',
        `min="${T}"`
      )

      +

      `
        <div class="full">

          <label>
            Available time slots

            <select
              name="time"
              id="slotSel">

              <option value="">
                Choose doctor and date first
              </option>

            </select>

          </label>

        </div>
      `,

      f => {

        if (
          !f.pid ||
          !f.did ||
          !f.date ||
          !f.time
        ) {
          return 'Select a patient, doctor, date and time slot.';
        }


        if (
          !slots(
            f.did,
            f.date
          ).includes(
            f.time
          )
        ) {
          return 'That slot was just taken. Pick another time.';
        }


        const id =
          DB.appts.length + 1;


        DB.appts.push({

          id,

          pid: f.pid,

          did: +f.did,

          date: f.date,

          time: f.time,

          status: 'Scheduled'

        });


        DB.notes.unshift({

          t:
            `Appointment booked ${f.date} ${f.time} with ${dName(+f.did)}`,

          pid: f.pid

        });


        log(
          `Booked appointment #${id}`
        );


        toast(
          'Appointment booked'
        );

      },

      'Book appointment'

    );


    const upd = () => {

      const f =
        $('#mf');

      const s =
        slots(
          f.did.value,
          f.date.value
        );


      $('#slotSel').innerHTML =

        f.did.value &&
        f.date.value

          ? (

              s.length

                ? s
                    .map(
                      t =>
                        `<option>${t}</option>`
                    )
                    .join('')

                : `
                    <option value="">
                      No free slots that day
                    </option>
                  `

            )

          : `
              <option value="">
                Choose doctor and date first
              </option>
            `;

    };


    $('#mf').did.onchange =
      upd;

    $('#mf').date.onchange =
      upd;

  },


  /* =========================
     APPOINTMENT STATUS
  ========================= */

  status(v) {

    const [
      id,
      s
    ] = v.split('|');


    DB.appts.find(
      a => a.id == id
    ).status = s;


    log(
      `Appointment #${id} set to ${s}`
    );


    render();

  },


  /* =========================
     CANCEL APPOINTMENT
  ========================= */

  cancel(id) {

    const r =
      prompt(
        'Reason for cancelling?'
      );


    if (
      !r ||
      !r.trim()
    ) {
      return toast(
        'A reason is required to cancel.'
      );
    }


    const a =
      DB.appts.find(
        x => x.id == id
      );


    a.status =
      'Cancelled';

    a.reason =
      r.trim();


    log(
      `Cancelled appointment #${id}: ${a.reason}`
    );


    render();

  },


  /* =========================
     NEW MEDICAL RECORD
  ========================= */

  newRec() {

    modal(

      'Add medical record',

      `

      <div class="full">

        ${sel(
          'pid',
          'Patient',
          patOpts()
        )}

      </div>


      <div class="full">

        ${fld(
          'dx',
          'Diagnosis'
        )}

      </div>


      <div class="full">

        ${fld(
          'rx',
          'Prescription'
        )}

      </div>


      <div class="full">

        <label>

          Treatment notes

          <textarea
            name="notes"
            rows="3">
          </textarea>

        </label>

      </div>

      `,

      f => {

        if (
          !f.pid ||
          !f.dx.trim() ||
          !f.rx.trim()
        ) {
          return 'Patient, diagnosis and prescription are required.';
        }


        DB.records.push({

          id:
            DB.records.length + 1,

          pid:
            f.pid,

          did:
            me.did || 1,

          date:
            T,

          dx:
            f.dx.trim(),

          rx:
            f.rx.trim(),

          notes:
            f.notes

        });


        log(
          `Added diagnosis for ${f.pid}`
        );


        toast(
          'Record saved'
        );

      }

    );

  },


  /* =========================
     PRINT PRESCRIPTION
  ========================= */

  rxPrint(id) {

    const r =
      DB.records.find(
        x => x.id == id
      );


    printDoc(

      `Prescription`,

      `

      <p>

        <b>Patient:</b>
        ${esc(
          pName(r.pid)
        )}

        <br>

        <b>Doctor:</b>
        ${esc(
          dName(r.did)
        )}

        <br>

        <b>Date:</b>
        ${r.date}

      </p>


      <p>

        <b>Diagnosis:</b>
        ${esc(r.dx)}

      </p>


      <p>

        <b>Rx:</b>
        ${esc(r.rx)}

      </p>


      <p>
        ${esc(r.notes)}
      </p>

      `
    );

  },


  /* =========================
     CREATE BILL
  ========================= */

  newBill() {

    modal(

      'Create bill',

      `

      <div class="full">

        ${sel(
          'pid',
          'Patient',
          patOpts()
        )}

      </div>

      ${fld(
        'c',
        'Consultation fee',
        0,
        'number',
        'min=0'
      )}

      ${fld(
        'l',
        'Lab charges',
        0,
        'number',
        'min=0'
      )}

      ${fld(
        'm',
        'Medicine charges',
        0,
        'number',
        'min=0'
      )}

      ${fld(
        'r',
        'Room/service charges',
        0,
        'number',
        'min=0'
      )}

      ${fld(
        'paid',
        'Amount paid now',
        0,
        'number',
        'min=0'
      )}

      `,

      f => {

        const v =
          [
            'c',
            'l',
            'm',
            'r',
            'paid'
          ].map(
            k => +f[k]
          );


        if (!f.pid) {
          return 'Select a patient.';
        }


        if (
          v.some(
            x =>
              isNaN(x) ||
              x < 0
          )
        ) {
          return 'Amounts must be zero or more.';
        }


        const items =
          [
            [
              'Consultation',
              v[0]
            ],

            [
              'Lab',
              v[1]
            ],

            [
              'Medicine',
              v[2]
            ],

            [
              'Room/service',
              v[3]
            ]

          ]

          .filter(
            i => i[1] > 0
          )

          .map(
            i => ({
              n: i[0],
              a: i[1]
            })
          );


        if (!items.length) {
          return 'Add at least one charge.';
        }


        if (
          v[4] >
          items.reduce(
            (s, i) =>
              s + i.a,
            0
          )
        ) {
          return 'Payment cannot exceed the total.';
        }


        DB.bills.push({

          id:
            DB.bills.length + 1,

          pid:
            f.pid,

          date:
            T,

          items,

          paid:
            v[4]

        });


        log(
          `Created bill for ${f.pid}`
        );


        toast(
          'Bill created'
        );

      }

    );

  },


  /* =========================
     PAYMENT
  ========================= */

  pay(id) {

    const b =
      DB.bills.find(
        x => x.id == id
      );


    const due =
      total(b) - b.paid;


    modal(

      `Record payment (due ${money(due)})`,

      fld(
        'amt',
        'Amount',
        due,
        'number',
        'min=1'
      ),

      f => {

        if (
          !(
            +f.amt > 0 &&
            +f.amt <= due
          )
        ) {
          return `Enter an amount between 1 and ${due}.`;
        }


        b.paid +=
          +f.amt;


        log(
          `Payment ${f.amt} on INV-${1000 + b.id}`
        );


        toast(
          'Payment recorded'
        );

      }

    );

  },


  /* =========================
     INVOICE
  ========================= */

  invoice(id) {

    const b =
      DB.bills.find(
        x => x.id == id
      );


    printDoc(

      `Invoice INV-${1000 + b.id}`,

      `

      <p>

        ${esc(
          pName(b.pid)
        )}

        ·

        ${b.date}

      </p>


      <table>

        ${b.items.map(i => `

          <tr>

            <td>
              ${esc(i.n)}
            </td>

            <td>
              ${money(i.a)}
            </td>

          </tr>

        `).join('')}


        <tr>

          <th>
            Total
          </th>

          <th>
            ${money(
              total(b)
            )}
          </th>

        </tr>


        <tr>

          <td>
            Paid
          </td>

          <td>
            ${money(
              b.paid
            )}
          </td>

        </tr>


        <tr>

          <td>
            Status
          </td>

          <td>
            ${bstat(b)}
          </td>

        </tr>

      </table>

      `
    );

  }

};


/* =========================================================
   PRINT DOCUMENT
========================================================= */

function printDoc(
  title,
  html
) {

  modal(

    title,

    `

    <div id="printable">

      ${html}

    </div>


    <div
      class="row"
      style="margin-top:1rem">

      <button
        class="btn"
        onclick="window.print()">

        Print or save as PDF

      </button>

    </div>

    `

  );

}


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

  if (!me) {
    return;
  }


  if (!can(view)) {
    view = 'dashboard';
  }


  $('#nav').innerHTML =
    NAV[me.role]
      .map(v => `

        <a
          tabindex="0"
          role="link"
          class="${v === view ? 'on' : ''}"
          data-a="go"
          data-id="${v}">

          ${label(v)}

        </a>

      `)
      .join('');


  $('#who').textContent =
    me.name;


  $('#role').textContent =
    me.role;


  $('#bellN').textContent =
    DB.notes.filter(x =>
      (!x.pid || x.pid === me.pid) &&
      (!x.role || x.role === me.role)
    ).length;


  const keep =
    document.activeElement?.id === 'q';


  $('#view').innerHTML =
    V[view]();


  if ($('#q')) {

    $('#q').oninput =
      e => {

        st.q =
          e.target.value;

        st.page =
          1;

        render();

      };


    if (keep) {

      const q =
        $('#q');

      q.focus();

      q.setSelectionRange(
        q.value.length,
        q.value.length
      );

    }

  }

}


/* =========================================================
   NAVIGATION ACTION
========================================================= */

A.go = async v => {

  view = v;

  st = {
    page: 1,
    q: ''
  };


  /* Load real doctors from backend */

  if (v === 'doctors') {

    $('#view').innerHTML =
      '<div class="skel"></div>';


    try {

      await loadDoctors();

    } catch (error) {

      $('#view').innerHTML = `

        <div class="card">

          <h2>
            Unable to load doctors
          </h2>

          <p class="err">
            ${esc(
              error.message
            )}
          </p>

        </div>

      `;

      return;

    }

  }


  render();

};


/* =========================================================
   GLOBAL CLICK HANDLER
========================================================= */

document.addEventListener(
  'click',
  e => {

    const b =
      e.target.closest(
        '[data-a]'
      );


    if (
      b &&
      A[b.dataset.a]
    ) {

      A[
        b.dataset.a
      ](
        b.dataset.id
      );

    }

  }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  'keydown',
  e => {

    if (
      e.key === 'Escape'
    ) {
      A.close();
    }


    if (
      e.key === 'Enter' &&
      e.target.matches('nav a')
    ) {
      e.target.click();
    }

  }
);


/* =========================================================
   IDLE LOGOUT
========================================================= */

function resetIdle() {

  clearTimeout(idle);


  if (me) {

    idle =
      setTimeout(
        () => {

          A.logout();

          alert(
            'You were signed out after 15 minutes of inactivity.'
          );

        },

        15 * 60 * 1000
      );

  }

}


[
  'click',
  'keydown',
  'mousemove'
].forEach(
  ev =>
    document.addEventListener(
      ev,
      resetIdle
    )
);


/* =========================================================
   REAL JWT LOGIN
========================================================= */

$('#loginForm').onsubmit =
  async e => {

    e.preventDefault();


    const f =
      Object.fromEntries(
        new FormData(
          e.target
        )
      );


    const err =
      $('#loginErr');


    err.textContent = '';


    if (
      !f.email?.trim() ||
      !f.password
    ) {

      err.textContent =
        'Enter your email and password.';

      return;

    }


    const button =
      e.target.querySelector(
        'button[type="submit"]'
      );


    if (button) {
      button.disabled = true;
    }


    try {

      const data =
        await apiFetch(
          '/auth/login',
          {
            method: 'POST',

            body:
              JSON.stringify({

                email:
                  f.email.trim(),

                password:
                  f.password

              })

          }
        );


      token =
        data.token;


      me =
        data.user;


      localStorage.setItem(
        'careline_token',
        token
      );


      localStorage.setItem(
        'careline_user',
        JSON.stringify(me)
      );


      view =
        'dashboard';


      st = {
        page: 1,
        q: ''
      };


      $('#login').hidden =
        true;


      $('#app').hidden =
        false;


      $('#view').innerHTML =
        '<div class="skel"></div>';


      render();


      resetIdle();


    } catch (error) {

      err.textContent =
        error.message ||
        'Unable to sign in.';

    } finally {

      if (button) {
        button.disabled = false;
      }

    }

  };


/* =========================================================
   START SESSION RESTORE
========================================================= */

loadSession();