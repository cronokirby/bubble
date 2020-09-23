open Jest;

describe("ExpectJs", () => {
  open ExpectJs;

  test("toBe", () =>
    expect(1 + 2) |> toBe(3)
  );

  test("toBe2", () =>
    expect(1 + 1) |> toBe(2)
  );
});
