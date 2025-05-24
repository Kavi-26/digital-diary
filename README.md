# Digital Diary

Welcome to the Digital Diary project! This application allows users to create, manage, and view their diary entries in a user-friendly interface. Below you will find an overview of the project, its features, and instructions on how to set it up.

## Features

- **Create Diary Entries**: Users can add new entries with a title and content.
- **View Diary Entries**: All diary entries are displayed in a list format, allowing users to easily browse through their past entries.
- **Edit Entries**: Users can modify existing diary entries.
- **Delete Entries**: Users have the option to remove entries they no longer wish to keep.
- **Local Storage**: All entries are saved in the browser's local storage, ensuring that data persists even after refreshing the page.
- **Responsive Design**: The application is designed to be fully responsive, providing a seamless experience on both desktop and mobile devices.

## Project Structure

```
digital-diary
├── src
│   ├── index.html          # Main HTML file
│   ├── css
│   │   ├── styles.css      # Main styles
│   │   └── responsive.css   # Responsive styles
│   ├── js
│   │   ├── app.js          # Main JavaScript file
│   │   ├── diary.js        # Diary entry logic
│   │   └── storage.js      # Local storage management
│   └── components
│       ├── entry-form.html  # Diary entry form
│       └── entry-list.html   # Diary entry list
├── assets
│   └── fonts               # Font files
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**: 
   ```
   cd digital-diary
   ```

3. **Open the Project**: Use your preferred code editor to open the project.

4. **Open `index.html`**: Launch the `index.html` file in your web browser to view the application.

5. **Start Adding Entries**: Use the entry form to start creating your diary entries!

## Usage Guidelines

- To create a new entry, fill out the form and submit it.
- To edit an entry, click on the edit button next to the entry in the list.
- To delete an entry, click on the delete button next to the entry in the list.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to submit a pull request.

## License

This project is open-source and available under the MIT License.