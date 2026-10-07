// js/story.js — 캐릭터 스토리 (character.html#id/story)
// 챕터 = { order, period(시기), title(챕터 이름), body(본문) }, order 순서로 위에서부터 나열
// 관리자: 칸을 클릭해 바로 수정, 아래 "+ 챕터 추가", 챕터 오른쪽 위 ×로 삭제
import { createCharList } from "./char-list.js";
import { h } from "./utils.js";

const story = createCharList({
  col: "chapters",
  listEl: document.getElementById("storyList"),
  emptyEl: document.getElementById("storyEmpty"),
  addBtn: document.getElementById("storyAdd"),
  defaults: { period: "", title: "", body: "" },
  focus: ".chapter-title",
  deleteLabel: (el) => el.querySelector(".chapter-title").textContent || "이 챕터",
  create: () =>
    h(
      "article",
      { class: "chapter" },
      h(
        "div",
        { class: "chapter-head" },
        h("span", { class: "chapter-star", "aria-hidden": "true" }, "✦"),
        h("span", { class: "chapter-period", "data-field": "period", "data-placeholder": "시기" }),
        h("button", { type: "button", class: "del-btn admin-only", "data-action": "delete", "aria-label": "챕터 삭제", title: "챕터 삭제" }, "×")
      ),
      h(
        "div",
        { class: "chapter-main" },
        h("h3", { class: "chapter-title", "data-field": "title", "data-placeholder": "챕터 이름" }),
        h("div", { class: "chapter-text", "data-field": "body", "data-placeholder": "본문", "data-multiline": true })
      )
    ),
});

export const showStory = (id) => story.show(id);
