import {
  convertDaysToMilliseconds,
  convertHoursToMilliseconds,
  convertMinutesToMilliseconds,
  convertSecondsToMilliseconds
} from "../src/storage-utils";

describe("MillisecondConversions --", () => {
  describe("the convertDaysToMilliseconds function", () => {
    it("should handle an input of 0", () => {
      const result = convertDaysToMilliseconds(0);
      expect(result).toEqual(0);
    });
    it("should handle an input of 1", () => {
      const result = convertDaysToMilliseconds(1);
      expect(result).toEqual(86400000);
    });
    it("should handle an input of 10", () => {
      const result = convertDaysToMilliseconds(10);
      expect(result).toEqual(864000000);
    });
  });
  describe("the convertHoursToMilliseconds function", () => {
    it("should handle an input of 0", () => {
      const result = convertHoursToMilliseconds(0);
      expect(result).toEqual(0);
    });
    it("should handle an input of 1", () => {
      const result = convertHoursToMilliseconds(1);
      expect(result).toEqual(3600000);
    });
    it("should handle an input of 10", () => {
      const result = convertHoursToMilliseconds(10);
      expect(result).toEqual(36000000);
    });
  });
  describe("the convertMinutesToMilliseconds function", () => {
    it("should handle an input of 0", () => {
      const result = convertMinutesToMilliseconds(0);
      expect(result).toEqual(0);
    });
    it("should handle an input of 1", () => {
      const result = convertMinutesToMilliseconds(1);
      expect(result).toEqual(60000);
    });
    it("should handle an input of 10", () => {
      const result = convertMinutesToMilliseconds(10);
      expect(result).toEqual(600000);
    });
  });
  describe("the convertSecondsToMilliseconds function", () => {
    it("should handle an input of 0", () => {
      const result = convertSecondsToMilliseconds(0);
      expect(result).toEqual(0);
    });
    it("should handle an input of 1", () => {
      const result = convertSecondsToMilliseconds(1);
      expect(result).toEqual(1000);
    });
    it("should handle an input of 10", () => {
      const result = convertSecondsToMilliseconds(10);
      expect(result).toEqual(10000);
    });
  });
});
