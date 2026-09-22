import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  VISIBLE_TIER_COUNT,
  defaultSkillRatings,
  listRoleNames,
  parseRoleDefinitions,
  splitTierRank,
} from "../src/data/parseRoleDefinitions.ts";

const csv = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/data/role-definitions.csv"),
  "utf8",
);

describe("parseRoleDefinitions", () => {
  it("groups each CSV role and keeps -- New Role -- last in the name list", () => {
    const disciplines = parseRoleDefinitions(csv);
    assert.equal(disciplines.length, 3);
    const role = disciplines[0];
    assert.equal(role.discipline, "Product Designer");
    assert.equal(role.definition, "");
    assert.match(role.tiers[0].description, /foundational design execution/);
    assert.equal(role.tiers.length, VISIBLE_TIER_COUNT);
    assert.equal(role.tiers[0].rank, "I Associate");
    assert.deepEqual(splitTierRank(role.tiers[0].rank), {
      numeral: "I",
      subtitle: "Associate",
    });
    assert.deepEqual(splitTierRank(role.tiers[1].rank), {
      numeral: "II",
      subtitle: "Mid-level",
    });
    assert.deepEqual(splitTierRank("I (Associate)"), {
      numeral: "I",
      subtitle: "Associate",
    });
    assert.match(role.tiers[0].description, /foundational design execution/);
    assert.doesNotMatch(role.tiers.map((tier) => tier.rank).join(" "), /Staff/);
    assert.equal(role.skills.length, 6);
    assert.equal(role.skills[0].title, "Technical Ability");
    assert.equal(role.skills[5].title, "Research & Data");
    assert.match(role.skills[5].definition, /research and analytics/i);
    const pm = disciplines[1];
    assert.equal(pm.discipline, "Product Manager");
    assert.equal(pm.skills.length, 6);
    assert.equal(pm.skills[0].title, "Product Sense");
    assert.equal(pm.skills[5].title, "Discovery & Research");
    assert.match(pm.tiers[0].description, /defined slice of the product/);
    assert.equal(disciplines[2].discipline, "-- New Role --");
    assert.deepEqual(listRoleNames(disciplines), [
      "Product Designer",
      "Product Manager",
      "-- New Role --",
    ]);
    assert.deepEqual(
      listRoleNames([
        {
          discipline: "-- New Role --",
          definition: "",
          tiers: [],
          skills: [],
        },
        {
          discipline: "Product Designer",
          definition: "",
          tiers: [],
          skills: [],
        },
      ]),
      ["Product Designer", "-- New Role --"],
    );
  });

  it("defaults every skill rating to tier 1", () => {
    const [role] = parseRoleDefinitions(csv);
    const ratings = defaultSkillRatings(role);
    assert.equal(Object.keys(ratings).length, 6);
    for (const value of Object.values(ratings)) {
      assert.equal(value, 1);
    }
  });
});
