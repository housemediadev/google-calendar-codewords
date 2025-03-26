# Google Calendar Keywords Explorer

An interactive web application for exploring keywords that trigger cover images in Google Calendar. This application allows you to search and discover keywords in both English and Spanish, showing representative images and related suggestions.

## Features

- 🔍 Real-time search functionality
- 🌍 Multi-language support (EN/ES)
- 🖼️ Google Calendar event illustrations
- 📱 Responsive design
- 🔄 Related keyword suggestions
- ⚡ Fast and lightweight
- 🎨 Modern UI/UX

## Technologies

- HTML5
- CSS3 (with Bootstrap 5)
- JavaScript (ES6+)
- Google Calendar event illustrations
- Node.js for development server

## Quick Start

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```
4. Open http://localhost:8080 in your browser

## Usage

1. Use the search bar to filter keywords in real-time
2. Switch language using the EN/ES button
3. Explore related words for each keyword
4. Click on cards to see larger images

## Contributing

1. Fork the repository
2. Create your contribution branch (`git checkout -b words/en/your-contribution`)
3. Commit your changes (`git commit -am 'Add new keywords'`)
4. Push to the branch (`git push origin words/en/your-contribution`)
5. Open a Pull Request


## Data Structure

To add new keywords, modify `js/keywords_en.json` or `js/keywords_es.json` following this format:

```json
[
  {
    "keyword": "google_calendar_keyword",
    "related": ["related1", "related2"]
  }
]
```

## Special Configurations

Some keywords have special configurations that affect their display:

- **Column Width**: Use `className: "col-12"` to make a keyword take full width
- **Image Override**: Use `imageFile: "custom-image"` to override the default image

Example in keywords/en.json:
```json
{
  "keyword": "xmas",
  "related": ["christmas"],
  "className": "col-12",
  "imageFile": "custom-image"
}
```

The application constructs image URLs using the standard Google Calendar image pattern:
`https://ssl.gstatic.com/calendar/images/eventillustrations/2024_v2/img_KEYWORD.svg`

## Credits

- Original keyword list from [mifran/google-calendar-image-keyword](https://github.com/mifran/google-calendar-image-keyword)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
