import { useState } from "react";
import { X, List, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CreateTodoModalProps {
  onClose: () => void;
  onCreate: (todoData: { title: string; date: Date; time: string }) => void;
}

export function CreateTodoModal({ onClose, onCreate }: CreateTodoModalProps) {
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState({ hour: "08", minute: "30" });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];

  const weekDays = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleContinue = () => {
    if (title.trim()) {
      onCreate({
        title: title.trim(),
        date: selectedDate,
        time: `${time.hour}:${time.minute}`
      });
      onClose();
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Criar</h2>
        </div>

        {/* To-do section */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-center px-6 py-4 bg-blue-200 rounded-xl mb-4">
            <List className="w-6 h-6 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">To-do</span>
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Title input */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
              className="w-full h-12 bg-gray-300 border-0 rounded-xl text-gray-700 font-medium placeholder:text-gray-500"
              autoFocus
            />
          </div>

          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <h3 className="font-medium text-gray-900">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-xs text-center text-gray-500 py-1 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleDateSelect(day)}
                  disabled={!day}
                  className={`
                    h-8 text-sm rounded flex items-center justify-center transition-colors
                    ${!day 
                      ? 'invisible' 
                      : isSelected(day)
                        ? 'bg-blue-500 text-white font-medium'
                        : isToday(day)
                          ? 'bg-blue-100 text-blue-600 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time picker */}
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={time.hour}
                onChange={(e) => setTime(prev => ({ ...prev, hour: e.target.value.padStart(2, '0') }))}
                className="w-16 h-10 text-center bg-gray-100 border border-gray-300 rounded text-sm font-medium"
              />
              <span className="text-gray-500 font-medium">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                step="5"
                value={time.minute}
                onChange={(e) => setTime(prev => ({ ...prev, minute: e.target.value.padStart(2, '0') }))}
                className="w-16 h-10 text-center bg-gray-100 border border-gray-300 rounded text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Continue button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleContinue}
            disabled={!title.trim()}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONTINUAR
          </Button>
        </div>
      </div>
    </div>
  );
}