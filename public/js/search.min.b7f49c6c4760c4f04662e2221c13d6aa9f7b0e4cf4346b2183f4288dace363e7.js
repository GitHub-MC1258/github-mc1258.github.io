(function(){const a=new URLSearchParams(window.location.search),e=a.get("q"),t=document.getElementById("search-page-input"),n=document.getElementById("search-page-results"),s=document.getElementById("search-query-term"),o=new FlexSearch.Document({document:{id:"id",index:["title","content","author"],store:["title","relpermalink","date","author","content"]},tokenize:"forward"});fetch("/index.json").then(e=>e.json()).then(n=>{n.forEach(e=>o.add(e)),e&&(t&&(t.value=e),s&&(s.textContent=e),i(e))});function i(e){const s=o.search(e,{limit:20,enrich:!0}),t=[],n=new Set;s.forEach(e=>e.result.forEach(e=>{n.has(e.id)||(n.add(e.id),t.push(e))})),r(t)}function r(e){if(!n)return;if(n.innerHTML="",e.length===0){document.getElementById("no-results-message").classList.remove("d-none");return}e.forEach(e=>{const t=e.doc,s=document.createElement("div");s.className="col-md-6 col-lg-4",s.innerHTML=`
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title"><a href="${t.relpermalink}" class="text-decoration-none">${t.title}</a></h5>
                        <p class="card-text text-muted small">${t.content.substring(0,150)}...</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 small text-muted">
                        ${t.date} — Par ${t.author}
                    </div>
                </div>`,n.appendChild(s)})}t&&t.addEventListener("input",e=>i(e.target.value))})()