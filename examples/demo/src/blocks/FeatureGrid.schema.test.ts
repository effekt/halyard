import { describe, expect, test } from "vitest";
import { featureGridSchema } from "./FeatureGrid.schema";
import { featureGridDefaults } from "./featureGridDefaults";

describe("featureGridSchema", () => {
  test("props authored before columns and compact existed still validate, unchanged", () => {
    const parsed = featureGridSchema.safeParse(featureGridDefaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(featureGridDefaults);
    }
  });

  test("accepts a column count in the closed range and a compact flag", () => {
    const parsed = featureGridSchema.safeParse({
      ...featureGridDefaults,
      columns: 3,
      compact: true,
    });
    expect(parsed.success).toBe(true);
  });

  test.each([1, 5, 2.5])("rejects the column count %s", (columns) => {
    expect(featureGridSchema.safeParse({ ...featureGridDefaults, columns }).success).toBe(false);
  });

  test("rejects a compact value that is not a boolean", () => {
    expect(featureGridSchema.safeParse({ ...featureGridDefaults, compact: "yes" }).success).toBe(
      false,
    );
  });
});
