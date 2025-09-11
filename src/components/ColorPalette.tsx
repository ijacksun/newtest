interface ColorPaletteProps {
  onColorSelect: (color: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function ColorPalette({ onColorSelect, onClose, position }: ColorPaletteProps) {
  const colors = [
    '#FFE066', // Amarelo
    '#66FFE0', // Ciano
    '#66B3FF', // Azul claro
    '#B366FF', // Roxo
    '#FF66B3', // Rosa
    '#FF6666', // Vermelho
    '#66FF66', // Verde
    '#FFA366', // Laranja
  ];

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div 
        className="fixed inset-0 z-30" 
        onClick={onClose}
      />
      
      {/* Paleta de cores */}
      <div
        className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-40"
        style={{
          left: position.x,
          top: position.y + 10,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => {
                onColorSelect(color);
                onClose();
              }}
              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
              style={{ backgroundColor: color }}
              title={`Grifar com cor ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}