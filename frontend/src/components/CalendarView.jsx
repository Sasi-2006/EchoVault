import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function CalendarView({ entries, onEdit }) {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  const [selectedDate, setSelectedDate] =
    useState(null);

  // --------------------------------
  // Calendar information
  // --------------------------------

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const monthName = currentDate.toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

  // --------------------------------
  // Move to previous month
  // --------------------------------

  function goToPreviousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );

    setSelectedDate(null);
  }

  // --------------------------------
  // Move to next month
  // --------------------------------

  function goToNextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );

    setSelectedDate(null);
  }

  // --------------------------------
  // Create calendar days
  // --------------------------------

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // --------------------------------
  // Entries grouped by date
  // --------------------------------

  const entriesByDate = useMemo(() => {
    const grouped = {};

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);

      const key = [
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ].join("-");

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(entry);
    });

    return grouped;
  }, [entries]);

  // --------------------------------
  // Get entries for selected date
  // --------------------------------

  const selectedEntries =
    selectedDate
      ? entriesByDate[
          [
            year,
            month,
            selectedDate,
          ].join("-")
        ] || []
      : [];

  // --------------------------------
  // Select date
  // --------------------------------

  function handleDateClick(day) {
    if (!day) {
      return;
    }

    setSelectedDate(day);
  }

  return (
    <div className="calendar-view">

      {/* Calendar header */}

      <div className="calendar-header">

        <button
          className="calendar-nav-button"
          onClick={goToPreviousMonth}
          type="button"
        >
          <ChevronLeft size={20} />
        </button>

        <h2>
          {monthName}
        </h2>

        <button
          className="calendar-nav-button"
          onClick={goToNextMonth}
          type="button"
        >
          <ChevronRight size={20} />
        </button>

      </div>

      {/* Week names */}

      <div className="calendar-weekdays">

        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <div key={day}>
            {day}
          </div>
        ))}

      </div>

      {/* Calendar */}

      <div className="calendar-grid">

        {calendarDays.map((day, index) => {

          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="calendar-day empty"
              />
            );
          }

          const dateKey = [
            year,
            month,
            day,
          ].join("-");

          const dayEntries =
            entriesByDate[dateKey] || [];

          const hasEntries =
            dayEntries.length > 0;

          const isSelected =
            selectedDate === day;

          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${
                isSelected
                  ? "selected"
                  : ""
              } ${
                isToday
                  ? "today"
                  : ""
              }`}
              onClick={() =>
                handleDateClick(day)
              }
            >

              <span className="calendar-day-number">
                {day}
              </span>

              {hasEntries && (
                <span className="calendar-entry-dot">
                  {dayEntries.length}
                </span>
              )}

            </button>
          );
        })}

      </div>

      {/* Selected date entries */}

      {selectedDate && (
        <div className="calendar-selected-section">

          <h3>
            {new Date(
              year,
              month,
              selectedDate
            ).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </h3>

          {selectedEntries.length === 0 ? (
            <p className="calendar-no-entry">
              No journal entries on this day.
            </p>
          ) : (
            <div className="calendar-entry-list">

              {selectedEntries.map(
                (entry) => (

                  <div
                    className="calendar-entry"
                    key={entry.id}
                  >

                    <div className="calendar-entry-mood">
                      {entry.mood}
                    </div>

                    <div className="calendar-entry-info">

                      <h4>
                        {entry.title}
                      </h4>

                      <p>
                        {entry.content.length > 120
                          ? `${entry.content.slice(
                              0,
                              120
                            )}...`
                          : entry.content}
                      </p>

                    </div>

                    <button
                      type="button"
                      className="calendar-edit-button"
                      onClick={() =>
                        onEdit?.(entry)
                      }
                    >
                      Edit
                    </button>

                  </div>

                )
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default CalendarView;