/* 分页器：章节导航 / 上下页 / 键盘翻页 / 进度条 / hash 记忆 */
(function () {
	"use strict";

	var pages = [].slice.call(document.querySelectorAll(".page"));
	var tocBox = document.getElementById("toc");
	var prevBtn = document.getElementById("prev-btn");
	var nextBtn = document.getElementById("next-btn");
	var fill = document.getElementById("progress-fill");
	var label = document.getElementById("progress-label");
	var current = 0;

	function titleOf(page) {
		var h = page.querySelector("h2");
		return h ? h.textContent.trim() : page.id;
	}

	// ── 侧边目录（按 data-part 分组） ──
	var lastPart = null;
	pages.forEach(function (page, i) {
		var part = page.getAttribute("data-part");
		if (part && part !== lastPart) {
			var head = document.createElement("li");
			head.className = "part";
			head.textContent = part;
			tocBox.appendChild(head);
			lastPart = part;
		}
		var li = document.createElement("li");
		var btn = document.createElement("button");
		btn.innerHTML = '<span class="num">' +
			(page.getAttribute("data-num") || String(i).padStart(2, "0")) +
			"</span><span>" + titleOf(page) + "</span>";
		btn.addEventListener("click", function () { go(i); });
		li.appendChild(btn);
		tocBox.appendChild(li);
	});

	var tocBtns = [].slice.call(tocBox.querySelectorAll("button"));

	function go(index, skipHash) {
		if (index < 0 || index >= pages.length) return;
		pages[current].classList.remove("active");
		tocBtns[current].classList.remove("active");
		current = index;
		pages[current].classList.add("active");
		tocBtns[current].classList.add("active");

		var pct = pages.length > 1 ? (current / (pages.length - 1)) * 100 : 100;
		fill.style.width = pct.toFixed(1) + "%";
		label.textContent = (current + 1) + " / " + pages.length;

		prevBtn.disabled = current === 0;
		nextBtn.disabled = current === pages.length - 1;
		prevBtn.innerHTML = current > 0
			? "<span>← 上一章</span>" + titleOf(pages[current - 1])
			: "<span>已是首章</span>—";
		nextBtn.innerHTML = current < pages.length - 1
			? "<span>下一章 →</span>" + titleOf(pages[current + 1])
			: "<span>已是末章</span>—";

		if (!skipHash) location.hash = pages[current].id;
		tocBtns[current].scrollIntoView({ block: "nearest" });
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	prevBtn.addEventListener("click", function () { go(current - 1); });
	nextBtn.addEventListener("click", function () { go(current + 1); });

	document.addEventListener("keydown", function (e) {
		if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
		if (e.key === "ArrowRight" || e.key === "PageDown") { go(current + 1); }
		else if (e.key === "ArrowLeft" || e.key === "PageUp") { go(current - 1); }
		else if (e.key === "Home") { go(0); }
		else if (e.key === "End") { go(pages.length - 1); }
	});

	window.addEventListener("hashchange", function () {
		var idx = indexByHash();
		if (idx >= 0 && idx !== current) go(idx, true);
	});

	function indexByHash() {
		var id = location.hash.replace("#", "");
		if (!id) return -1;
		for (var i = 0; i < pages.length; i++) {
			if (pages[i].id === id) return i;
		}
		return -1;
	}

	var start = indexByHash();
	go(start >= 0 ? start : 0, true);
})();
