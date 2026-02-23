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

        // ── Search bar ──
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'cr-search-wrapper';
        searchWrapper.innerHTML = `
            <span class="cr-search-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
            </span>
            <input
                type="search"
                id="cr-search"
                class="cr-search-input"
                placeholder="Search by subject name or code…"
                aria-label="Search courses"
                autocomplete="off"
            >
            <span class="cr-search-count" id="cr-search-count"></span>
        `;
        container.appendChild(searchWrapper);

        // ── Course grid ──
        const gridWrapper = document.createElement('div');
        gridWrapper.id = 'cr-grid-wrapper';

        let html = '';
        Object.entries(grouped).forEach(([yr, sems]) => {
            html += `<div class="cr-year-block" data-year="${yr}">
                <h3 class="cr-year-heading">${yr} Year</h3>`;

            Object.entries(sems).forEach(([sem, courses]) => {
                const total = courses.reduce((s, c) => s + Number(c.credit), 0);
                html += `
                <div class="cr-sem-block" data-sem="${sem}">
                    <div class="cr-sem-header">
                        <span class="cr-sem-label">${sem} Semester</span>
                        <span class="cr-sem-badge">${total} units</span>
                    </div>
                    <div class="cr-grid">`;

                courses.forEach(c => {
                    html += `
                    <div class="cr-card"
                         data-code="${c.code.toLowerCase()}"
                         data-desc="${c.description.toLowerCase()}">
                        <span class="cr-code">${c.code}</span>
                        <p class="cr-desc">${c.description}</p>
                        <span class="cr-credit">${c.credit} units</span>
                    </div>`;
                });

                html += `</div></div>`;
            });

            html += `</div>`;
        });

        gridWrapper.innerHTML = html;
        container.appendChild(gridWrapper);

        // ── Search logic ──
        const searchInput = document.getElementById('cr-search');
        const countEl     = document.getElementById('cr-search-count');

        searchInput.addEventListener('input', () => {
            const q = searchInput.value.trim().toLowerCase();

            const allCards    = gridWrapper.querySelectorAll('.cr-card');
            const semBlocks   = gridWrapper.querySelectorAll('.cr-sem-block');
            const yearBlocks  = gridWrapper.querySelectorAll('.cr-year-block');

            let visibleCount = 0;

            allCards.forEach(card => {
                const match = !q ||
                    card.dataset.code.includes(q) ||
                    card.dataset.desc.includes(q);
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });

            // Hide semester blocks that have no visible cards
            semBlocks.forEach(block => {
                const anyVisible = [...block.querySelectorAll('.cr-card')]
                    .some(c => c.style.display !== 'none');
                block.style.display = anyVisible ? '' : 'none';
            });

            // Hide year blocks that have no visible semesters
            yearBlocks.forEach(block => {
                const anyVisible = [...block.querySelectorAll('.cr-sem-block')]
                    .some(s => s.style.display !== 'none');
                block.style.display = anyVisible ? '' : 'none';
            });

            // Count feedback
            if (q) {
                countEl.textContent = visibleCount
                    ? `${visibleCount} subject${visibleCount !== 1 ? 's' : ''} found`
                    : 'No subjects found';
                countEl.style.color = visibleCount ? '#FF52A0' : '#e74c3c';
            } else {
                countEl.textContent = '';
            }
        });

    } catch (err) {
        container.innerHTML = '<p style="color:#e74c3c;">⚠️ Could not load courses.</p>';
        console.error(err);
    }
})();