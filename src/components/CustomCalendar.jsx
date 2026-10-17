import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateToString(date) {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatSelectedDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "Choose a date";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function getToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function isSameDay(first, second) {
  return (
    first &&
    second &&
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

export default function CustomCalendar({
  value,
  onChange,
  minDate,
}) {
  const wrapperRef = useRef(null);

  const today = useMemo(
    () => getToday(),
    []
  );

  const minimumDate = useMemo(
    () =>
      minDate
        ? parseDate(minDate)
        : today,
    [minDate, today]
  );

  const selectedDate = useMemo(
    () => parseDate(value),
    [value]
  );

  const [isOpen, setIsOpen] =
    useState(false);

  const [visibleMonth, setVisibleMonth] =
    useState(
      () =>
        selectedDate ||
        minimumDate ||
        today
    );

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const calendarDays = useMemo(() => {
    const year =
      visibleMonth.getFullYear();

    const month =
      visibleMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays =
      new Date(
        year,
        month,
        0
      ).getDate();

    const days = [];

    for (
      let index = firstDay - 1;
      index >= 0;
      index--
    ) {
      const day =
        previousMonthDays - index;

      days.push({
        date: new Date(
          year,
          month - 1,
          day
        ),
        currentMonth: false,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push({
        date: new Date(
          year,
          month,
          day
        ),
        currentMonth: true,
      });
    }

    const remaining =
      42 - days.length;

    for (
      let day = 1;
      day <= remaining;
      day++
    ) {
      days.push({
        date: new Date(
          year,
          month + 1,
          day
        ),
        currentMonth: false,
      });
    }

    return days;
  }, [visibleMonth]);

  const previousMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };

  const nextMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };

  const handleDateSelect = (date) => {
    if (
      date < minimumDate
    ) {
      return;
    }

    onChange(dateToString(date));
    setIsOpen(false);
  };

  const canGoPrevious = (() => {
    const previousMonthDate =
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() - 1,
        1
      );

    const minimumMonth =
      new Date(
        minimumDate.getFullYear(),
        minimumDate.getMonth(),
        1
      );

    return (
      previousMonthDate >=
      minimumMonth
    );
  })();

  return (
    <div
      className="custom-calendar"
      ref={wrapperRef}
    >
      <button
        type="button"
        className={
          isOpen
            ? "custom-calendar-trigger open"
            : "custom-calendar-trigger"
        }
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="custom-calendar-trigger-icon">
          <CalendarDays size={20} />
        </span>

        <span
          className={
            value
              ? "custom-calendar-value selected"
              : "custom-calendar-value"
          }
        >
          {formatSelectedDate(value)}
        </span>

        <span className="custom-calendar-trigger-arrow">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div
          className="custom-calendar-dropdown"
          role="dialog"
          aria-label="Choose appointment date"
        >
          <div className="custom-calendar-top">
            <div>
              <span className="custom-calendar-eyebrow">
                Appointment date
              </span>

              <strong>
                {MONTHS[
                  visibleMonth.getMonth()
                ]}{" "}
                {visibleMonth.getFullYear()}
              </strong>
            </div>

            <div className="custom-calendar-navigation">
              <button
                type="button"
                onClick={previousMonth}
                disabled={!canGoPrevious}
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="custom-calendar-divider" />

          <div className="custom-calendar-weekdays">
            {WEEKDAYS.map(
              (weekday) => (
                <span key={weekday}>
                  {weekday}
                </span>
              )
            )}
          </div>

          <div className="custom-calendar-grid">
            {calendarDays.map(
              ({
                date,
                currentMonth,
              }) => {
                const disabled =
                  date < minimumDate;

                const selected =
                  isSameDay(
                    date,
                    selectedDate
                  );

                const isToday =
                  isSameDay(
                    date,
                    today
                  );

                return (
                  <button
                    type="button"
                    key={dateToString(
                      date
                    )}
                    className={[
                      "custom-calendar-day",
                      currentMonth
                        ? ""
                        : "outside",
                      disabled
                        ? "disabled"
                        : "",
                      selected
                        ? "selected"
                        : "",
                      isToday
                        ? "today"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={disabled}
                    onClick={() =>
                      handleDateSelect(
                        date
                      )
                    }
                    aria-label={date.toLocaleDateString(
                      "en-US",
                      {
                        weekday:
                          "long",
                        month:
                          "long",
                        day: "numeric",
                        year:
                          "numeric",
                      }
                    )}
                  >
                    <span>
                      {date.getDate()}
                    </span>

                    {selected && (
                      <Check
                        className="custom-calendar-check"
                        size={11}
                      />
                    )}
                  </button>
                );
              }
            )}
          </div>

          <div className="custom-calendar-footer">
            <span>
              <i className="calendar-dot today-dot" />
              Today
            </span>

            <span>
              <i className="calendar-dot selected-dot" />
              Selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}