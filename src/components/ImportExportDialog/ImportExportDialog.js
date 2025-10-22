import React, { useState, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Download, Upload, FileText, Database, Check, AlertTriangle } from 'lucide-react';

// Теми для диалогов
const lightTheme = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#334155',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  border: 'rgba(255, 255, 255, 0.1)',
  accent: '#667eea',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444'
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: ${props => props.theme.background};
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  flex: 1;
  color: ${props => props.theme.text};
`;

const CloseButton = styled.button`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 8px;
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.accent};
    color: white;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormatOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const FormatOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: ${props => props.$selected ? props.theme.accent : props.theme.surface};
  border: 2px solid ${props => props.$selected ? props.theme.accent : props.theme.border};
  border-radius: 12px;
  color: ${props => props.$selected ? 'white' : props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.accent};
    transform: translateY(-2px);
  }
`;

const FormatIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$selected ? 'rgba(255, 255, 255, 0.2)' : props.theme.surface};
  border-radius: 8px;
`;

const FormatName = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const FormatDescription = styled.span`
  font-size: 12px;
  color: ${props => props.$selected ? 'rgba(255, 255, 255, 0.8)' : props.theme.textSecondary};
  text-align: center;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadArea = styled.div`
  border: 2px dashed ${props => props.theme.border};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.theme.surface};

  &:hover {
    border-color: ${props => props.theme.accent};
    background: ${props => props.theme.background};
  }
`;

const UploadIcon = styled.div`
  color: ${props => props.theme.textSecondary};
  margin-bottom: 12px;
`;

const UploadText = styled.p`
  color: ${props => props.theme.text};
  margin-bottom: 8px;
  font-weight: 600;
`;

const UploadSubtext = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${props => props.theme.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
`;

const FileIcon = styled.div`
  color: ${props => props.theme.success};
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const FileSize = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
`;

const ImportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.theme.surface};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.background};
  }
`;

const OptionText = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 4px;
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
`;

const Radio = styled.input`
  width: 18px;
  height: 18px;
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  color: ${props => props.theme.warning};
`;

const WarningIcon = styled.div`
  flex-shrink: 0;
`;

const WarningText = styled.div`
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: ${props => props.theme.surface};
    color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};

    &:hover {
      background: ${props => props.theme.background};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

function ImportExportDialog({ mode, onClose, onExport, onImport, currentDataCount, isDarkTheme }) {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importOption, setImportOption] = useState('replace');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleExportClick = () => {
    onExport(selectedFormat);
  };

  const handleImportClick = () => {
    if (!selectedFile) return;
    
    importData(selectedFile, (importedData, error) => {
      if (error) {
        alert(`Ошибка импорта: ${error}`);
        return;
      }
      
      onImport(importedData, importOption === 'merge');
    });
  };

  const importData = (file, callback) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let importedData;
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Неверный формат JSON файла. Ожидается объект с полем "data".');
          }
          importedData = data.data;
        } else if (file.name.endsWith('.csv')) {
          // Простой CSV парсинг
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV файл пуст или содержит только заголовки');
          }
          
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
          importedData = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
            const item = {};
            headers.forEach((header, i) => {
              item[header] = values[i] || '';
            });
            
            return {
              title: item.title || `Импортированный элемент ${index + 1}`,
              type: item.type || 'anime',
              status: item.status || 'planned',
              rating: item.rating ? parseInt(item.rating) : 0,
              watchedEpisodes: item.watchepisodes ? parseInt(item.watchepisodes) : 0,
              totalEpisodes: item.totalepisodes ? parseInt(item.totalepisodes) : undefined,
              comment: item.comment || '',
              url: item.url || '',
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString()
            };
          });
        } else {
          throw new Error('Неподдерживаемый формат файла');
        }
        
        callback(importedData, null);
      } catch (error) {
        callback(null, error.message);
      }
    };
    
    reader.onerror = () => {
      callback(null, 'Ошибка чтения файла');
    };
    
    reader.readAsText(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderExportContent = () => (
    <Content>
      <Section>
        <SectionTitle>
          <Download size={20} />
          Экспорт данных
        </SectionTitle>
        <p style={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : '#64748b', margin: 0 }}>
          Экспортируйте вашу коллекцию для резервного копирования или переноса в другое устройство.
        </p>
      </Section>

      <Section>
        <SectionTitle>Формат экспорта</SectionTitle>
        <FormatOptions>
          <FormatOption 
            $selected={selectedFormat === 'json'} 
            onClick={() => setSelectedFormat('json')}
          >
            <FormatIcon $selected={selectedFormat === 'json'}>
              <FileText size={20} />
            </FormatIcon>
            <FormatName>JSON</FormatName>
            <FormatDescription $selected={selectedFormat === 'json'}>
              Рекомендуется для резервных копий
            </FormatDescription>
          </FormatOption>

          <FormatOption 
            $selected={selectedFormat === 'csv'} 
            onClick={() => setSelectedFormat('csv')}
          >
            <FormatIcon $selected={selectedFormat === 'csv'}>
              <Database size={20} />
            </FormatIcon>
            <FormatName>CSV</FormatName>
            <FormatDescription $selected={selectedFormat === 'csv'}>
              Для таблиц и Excel
            </FormatDescription>
          </FormatOption>
        </FormatOptions>
      </Section>

      <Section>
        <SectionTitle>Информация</SectionTitle>
        <FileInfo>
          <FileIcon>
            <Check size={20} />
          </FileIcon>
          <FileDetails>
            <FileName>Будет экспортировано {currentDataCount} записей</FileName>
            <FileSize>Включая оценки, комментарии и прогресс просмотра</FileSize>
          </FileDetails>
        </FileInfo>
      </Section>

      <ButtonGroup>
        <Button type="button" className="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button type="button" className="primary" onClick={handleExportClick}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Экспортировать
        </Button>
      </ButtonGroup>
    </Content>
  );

  const renderImportContent = () => (
    <Content>
      <Section>
        <SectionTitle>
          <Upload size={20} />
          Импорт данных
        </SectionTitle>
        <p style={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : '#64748b', margin: 0 }}>
          Импортируйте данные из ранее созданной резервной копии или CSV файла.
        </p>
      </Section>

      <Section>
        <SectionTitle>Выберите файл</SectionTitle>
        {!selectedFile ? (
          <FileUploadArea 
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            <UploadIcon>
              <Upload size={32} />
            </UploadIcon>
            <UploadText>Нажмите для выбора файла или перетащите его сюда</UploadText>
            <UploadSubtext>Поддерживаемые форматы: JSON, CSV</UploadSubtext>
          </FileUploadArea>
        ) : (
          <FileInfo>
            <FileIcon>
              <Check size={20} />
            </FileIcon>
            <FileDetails>
              <FileName>{selectedFile.name}</FileName>
              <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
            </FileDetails>
            <CloseButton 
              onClick={() => setSelectedFile(null)}
              style={{ padding: '4px' }}
            >
              <X size={16} />
            </CloseButton>
          </FileInfo>
        )}
        <FileInput
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileSelect}
        />
      </Section>

      {selectedFile && (
        <>
          <Section>
            <SectionTitle>Опции импорта</SectionTitle>
            <ImportOptions>
              <OptionLabel>
                <Radio
                  type="radio"
                  name="importOption"
                  value="replace"
                  checked={importOption === 'replace'}
                  onChange={(e) => setImportOption(e.target.value)}
                />
                <OptionText>
                  <OptionTitle>Заменить все данные</OptionTitle>
                  <OptionDescription>
                    Удалит текущую коллекцию ({currentDataCount} записей) и заменит её импортированными данными
                  </OptionDescription>
                </OptionText>
              </OptionLabel>

              <OptionLabel>
                <Radio
                  type="radio"
                  name="importOption"
                  value="merge"
                  checked={importOption === 'merge'}
                  onChange={(e) => setImportOption(e.target.value)}
                />
                <OptionText>
                  <OptionTitle>Объединить с текущими данными</OptionTitle>
                  <OptionDescription>
                    Добавит импортированные записи к текущей коллекции
                  </OptionDescription>
                </OptionText>
              </OptionLabel>
            </ImportOptions>
          </Section>

          {importOption === 'replace' && (
            <Warning>
              <WarningIcon>
                <AlertTriangle size={20} />
              </WarningIcon>
              <WarningText>
                Внимание: это действие удалит все текущие данные и заменит их импортированными. Это действие нельзя отменить.
              </WarningText>
            </Warning>
          )}
        </>
      )}

      <ButtonGroup>
        <Button type="button" className="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button 
          type="button" 
          className="primary" 
          onClick={handleImportClick}
          disabled={!selectedFile}
        >
          <Upload size={18} style={{ marginRight: '8px' }} />
          Импортировать
        </Button>
      </ButtonGroup>
    </Content>
  );

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <Overlay onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <Header>
            <Title>
              {mode === 'export' ? 'Экспорт данных' : 'Импорт данных'}
            </Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          {mode === 'export' ? renderExportContent() : renderImportContent()}
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}

export default ImportExportDialog;