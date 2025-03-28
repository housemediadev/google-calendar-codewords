# Google Calendar Codewords
![image](https://github.com/user-attachments/assets/927dee20-c8a3-461a-af9b-5e4eff2d56fe)

A web application that allows users to explore and search through Google Calendar event keywords and their related terms. The application supports multiple languages and features a modern, responsive design.

## Features

- 🔍 Keyword search with real-time filtering
- 🌐 Multi-language support (English and Spanish)
- 📱 Responsive design for all devices
- 🎨 Modern UI with smooth animations
- 📱 Lazy loading for optimized performance
- 🌓 Dark mode support

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd google-calendar-codewords
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

## Project Structure

```
google-calendar-codewords/
├── css/
│   └── styles.css          # Application styles
├── js/
│   └── app.js              # Main application logic
├── locales/
│   ├── keywords/
│   │   ├── en.json        # English keywords
│   │   └── es.json        # Spanish keywords
│   └── translations/
│       ├── en.json        # English translations
│       └── es.json        # Spanish translations
└── index.html             # Main HTML file
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- i18next for internationalization

## Customization

### Colors
The application uses CSS variables for easy customization. Modify the colors in `:root` in [styles.css](cci:7://file:///home/bound3r/Development/housemedia/hm/google-calendar-codewords/css/styles.css:0:0-0:0):

```css
:root {
  --primary-color: #4285f4;  /* Google's primary blue */
  --secondary-color: #34a853; /* Google's green */
  --accent-color: #ea4335;    /* Google's red */
}
```

### Keywords
Add new keywords by modifying the JSON files in the `locale/keywords` directory. Each keyword should have the following structure:

```json
{
  "keyword": "example",
  "imageFile": "optional_image_name",
  "related": ["related1", "related2"],
  "className": "optional-class-name"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Google Calendar for providing the event illustrations
- i18next for internationalization support
- Bootstrap for the responsive framework
