// js/memo.js — 캐릭터 메모 (character.html#id/memo)
// 메모 = { order, title(제목), body(본문) }. 우측 상단 검색창으로 제목·본문을 걸러봅니다.
// 관리자: 칸을 클릭해 바로 수정, 상단 "+ 메모 추가", 메모 오른쪽 위 ×로 삭제
import { createCharList } from "./char-list.js";
import { h } from "./utils.js";

const searchEl = document.getElementById("memoSearch");
const noResultEl = document.getElementById("memoNoResult");

const memo = createCharList({
  col: "memos",
  listEl: document.getElementById("memoList"),
  emptyEl: document.getElementById("memoEmpty"),
  addBtn: document.getElementById("memoAdd"),
  defaults: { title: "", body: "" },
  focus: ".memo-title",
  deleteLabel: (el) => el.querySelector(".memo-title").textContent || "이 메모",
  onRender: applySearch,
  create: () =>
    h(
      "article",
      { class: "memo" },
      h(
        "div",
        { class: "memo-head" },
        h("h3", { class: "memo-title", "data-field": "title", "data-placeholder": "제목" }),
        h("button", { type: "button", class: "del-btn admin-only", "data-action": "delete", "aria-label": "메모 삭제", title: "메모 삭제" }, "×")
      ),
      h("p", { class: "memo-text", "data-field": "body", "data-placeholder": "본문", "data-multiline": true })
    ),
});

// 띄어쓰기로 나눈 단어가 모두 들어 있는 메모만 표시 (대소문자 무시)
function applySearch() {
  const words = searchEl.value.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  for (const el of memo.items.values()) {
    const text = el.textContent.toLowerCase();
    const match = words.every((w) => text.includes(w));
    el.hidden = !match;
    if (match) shown++;
  }
  noResultEl.hidden = !(words.length && memo.items.size && !shown);
}

searchEl.addEventListener("input", applySearch);

export function showMemo(id) {
  if (memo.show(id)) {
    searchEl.value = ""; // 다른 캐릭터로 바뀌면 검색어 초기화
    noResultEl.hidden = true;
  }
}
