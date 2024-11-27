interface Machine {
  id: number;
  name: string;
  dailyTarget: number;
  hourTarget: number;
  actual: number;
  isConnect: boolean;
  enable: boolean;
  is_Blink: boolean;
}

interface CardProps {
  machine: Machine;
  isDarkMode: boolean;
}

const Card = ({ machine, isDarkMode }: CardProps) => {
  return (
    <div className="block relative w-[calc(100%/5.08)] flex-shrink-0 hover:scale-[105%] transition-transform select-none">
      <div
        className={`py-8 rounded-2xl ${isDarkMode ? 'text-white' : 'text-black'} shadow-inner shadow-[inset_0px_0px_15px_rgba(255,255,255,0.8)] flex flex-col items-center justify-between ${
          !machine.isConnect
            ? "bg-notConnect disabled shadow-[inset_0px_0px_4px_rgba(255,255,255,1)]"
            : !machine.enable
              ? "bg-gray-400 text-gray-200 opacity-30"
              : "bg-connect shadow-[inset_0px_0px_4px_rgba(255,255,255,1)]"
        }`}
      >
        <div className="text-xl md:text-2xl font-bold flex items-center justify-between w-full max-w-sm py-0 select-none">
          <div className="text-center w-2/5 text-base md:text-3xl">{String(machine.id).padStart(2, "0")}</div>
          <div className={`w-[2px] h-9 ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
          <div className="text-center w-3/5 text-base md:text-3xl">{machine.name}</div>
        </div>

        <div className="grid grid-cols-2 gap-y-12 text-center mt-10 gap-x-0">
          <div className="flex flex-col justify-center items-center">
            <div className="font-bold text-md md:text-md select-none">MỤC TIÊU NGÀY</div>
            <div className="text-md md:text-md select-none">(DAILY TARGET)</div>
          </div>
          <div className="text-4xl md:text-5xl font-bold select-none">{machine.dailyTarget}</div>

          <div className="flex flex-col justify-center items-center">
            <div className="font-bold text-md md:text-md select-none">MỤC TIÊU GIỜ</div>
            <div className="text-md md:text-md select-none">(HOURLY TARGET)</div>
          </div>
          <div className="text-4xl md:text-5xl font-bold select-none">{machine.hourTarget}</div>

          <div className={`flex flex-col justify-center items-center ${machine.is_Blink && machine.enable ? "blink" : ""}`}>
            <div className="font-bold text-md md:text-md select-none">THỰC HIỆN</div>
            <div className="text-md md:text-md select-none">(ACTUAL)</div>
          </div>
          <div className="text-4xl md:text-5xl font-bold select-none">
            <span className={machine.is_Blink && machine.enable ? "blink" : ""}>{machine.actual}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
