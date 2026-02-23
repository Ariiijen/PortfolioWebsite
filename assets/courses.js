(async function loadCourses() {
        const JSON_URL  = 'https://raw.githubusercontent.com/Ariiijen/JSON-files/refs/heads/main/courses.json';
        const PROXY_URL = 'https://api.allorigins.win/get?url=' + encodeURIComponent(JSON_URL);
        const container = document.getElementById('courses-container');

        try {
            const res     = await fetch(PROXY_URL);
            const wrapper = await res.json();
            const data    = JSON.parse(wrapper.contents);

            // Group: year → sem → courses[]
            const grouped = {};
            data.courses.forEach(c => {
                const yr  = c.year_level;
                const sem = c.sem;
                if (!grouped[yr])      grouped[yr]      = {};
                if (!grouped[yr][sem]) grouped[yr][sem] = [];
                grouped[yr][sem].push(c);
            });

            let html = '';
            Object.entries(grouped).forEach(([yr, sems]) => {
                html += `<div class="cr-year-block">
                    <h3 class="cr-year-heading">${yr} Year</h3>`;

                Object.entries(sems).forEach(([sem, courses]) => {
                    const total = courses.reduce((s, c) => s + Number(c.credit), 0);
                    html += `
                    <div class="cr-sem-block">
                        <div class="cr-sem-header">
                            <span class="cr-sem-label">${sem} Semester</span>
                            <span class="cr-sem-badge">${total} units</span>
                        </div>
                        <div class="cr-grid">`;

                    courses.forEach(c => {
                        html += `
                        <div class="cr-card">
                            <span class="cr-code">${c.code}</span>
                            <p class="cr-desc">${c.description}</p>
                            <span class="cr-credit">${c.credit} units</span>
                        </div>`;
                    });

                    html += `</div></div>`;
                });

                html += `</div>`;
            });

            container.innerHTML = html;

        } catch (err) {
            container.innerHTML = '<p style="color:#e74c3c;"> Could not load courses.</p>';
            console.error(err);
        }
    })();