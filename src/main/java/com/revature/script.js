// add variable references and event listeners here!

/**
 * Handles the search form submission and updates the UI with search results.
 * 
 * @async
 * @param {Event} event - The form submission event.
 * 
 * @description
 * This function is triggered when the user submits the search form with id 'search-form'.
 *
 * It performs the following actions:
 * 1. Prevents the default form submission behavior.
 * 2. Retrieves the search query from the textbox input.
 * 3. Gets the selected search type (title, ISBN, or author) from the 'search-type' select element.
 * 4. Calls the searchBooks() function with the query and search type.
 * 5. Waits for the searchBooks() function to return results from the Open Library API.
 * 6. Passes the returned book data to the displayBookList() function to update the UI.
 * 7. Handles any errors that may occur during the search process.
 */

// Asynchronous function to search for books based on query and type

async function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    const type = document.getElementById('search-type').value;

    try {
        const books = await searchBooks(query, type);
        displayBookList(books);
    } catch (error) {
        console.error(error);
        alert('Error fetching books. Please try again.');
    }
}

/**
 * Searches for books using the Open Library API based on the given query and type.
 *
 * @async
 * @param {string} query - The search term (title, ISBN, or author name).
 * @param {string} type - The type of search to perform (e.g., 'title', 'isbn', 'author').
 * @returns {Promise<Array>} A promise that resolves to an array of book objects.
 *
 * @description
 * This function allows users to search for books using the Open Library API.
 * It performs the following actions:
 * 1. Uses the query and type parameters to construct the API request.
 * 2. Fetches data from the Open Library API.
 * 3. Processes the API response to extract relevant book information.
 * 4. Limits the results to a maximum of 10 books.
 * 5. Returns an array of book objects with the following properties:
 *    - title: The book's title
 *    - author_name: The name of the author(s)
 *    - isbn: The book's ISBN
 *    - cover_i: Cover image identifier
 *    - ebook_access: Information about ebook availability
 *    - first_publish_year: Year of first publication
 *    - ratings_sortable: Book ratings information
 * 
 * 
 */

async function searchBooks(query, type) {
    // Google Books API base URL
    const url = `https://www.googleapis.com/books/v1/volumes?q=${type}:${encodeURIComponent(query)}&maxResults=10`;

    // Fetch data from the Google Books API
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    // Parse the JSON response
    const data = await response.json();

    // Map the books data into a usable format
    return data.items.map(book => {
        const volumeInfo = book.volumeInfo;

        return {
            title: volumeInfo.title || 'No Title',
            author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'No Author',
            cover_i: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
            ebook_access: book.accessInfo && book.accessInfo.epub && book.accessInfo.epub.isAvailable ? 'Borrowable' : 'No eBook Info',
            first_publish_year: volumeInfo.publishedDate ? volumeInfo.publishedDate.split('-')[0] : 'Unknown Year',
            isbn: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers[0].identifier : 'No ISBN',
            ratings_sortable: volumeInfo.averageRating || 0
        };
    });
}

/**
* Takes in a list of books and updates the UI accordingly.
*
* @param {Array} books - An array of book objects to be displayed.
*
* @description
* This function takes an array of book objects and creates a visual representation
* of each book as a list item (<li>) within an unordered list (<ul>). 
* It performs the following actions:
* 
* 1. Targets the unordered list with the id 'book-list'.
* 2. Clears the inner HTML of the list.
* 3. For each book in the 'books' array, creates an <li> element containing:
*    - The book's title within an element that has a class of `title-element`
*    - The book's cover image within an element that has a class of `cover-element`
*    - The book’s rating within an element that has a class of `rating-element`
*    - The book’s e-book access value within an element that has a class of `ebook-element`
*    Note: The order and specific layout of this information is flexible 
*    and determined by the developer.
* 4. Appends each created <li> element to the 'book-list' <ul>.
* 5. Ensures that the 'selected-book' element is not visible.
*/

function displayBookList(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';

    if (books.length === 0) {
        bookList.innerHTML = '<p>No books found.</p>'; // Handle no results
        bookList.style.display = 'block'; // Ensure book-list is displayed
        return;
    }

    books.forEach(book => {
        const listItem = document.createElement('li');
        listItem.classList.add('book-item');
        listItem.dataset.isbn = book.isbn;
        listItem.onclick = () => displaySingleBook(book);

        const coverImg = book.cover_i 
            ? `${book.cover_i}`
            : 'https://via.placeholder.com/150';

        listItem.innerHTML = `
            <img src="${coverImg}" alt="${book.title} Cover" class="cover-element">
            <h2 class="title-element">${book.title}</h2>
            <p class="author-element">Author: ${book.author}</p>
            <p class="rating-element">Rating: ${book.ratings_sortable}</p>
            <p class="ebook-element">eBook: ${book.ebook_access}</p>
        `;

        bookList.appendChild(listItem);
    });

    bookList.style.display = 'block'; // Ensure book-list is visible after adding items
}
/**
 * Displays detailed information about a single book when it's clicked.
 * 
 * @param {Object} book - The book object containing detailed information.
 * 
 * @description
 * This function is triggered when a user clicks on a book in the list.
 * It updates the UI to show detailed information about the selected book.
 * 
 * The function performs the following actions:
 * 1. Hides the unordered list element with id 'book-list'.
 * 2. Makes the element with id 'selected-book' visible.
 * 3. Populates the 'selected-book' element with the following book details:
 *    - Title
 *    - Author
 *    - First publish year
 *    - Cover image
 *    - ISBN
 *    - Ebook access value
 *    - Rating
 * 
 * Note: The order and specific layout of the book information within the
 * 'selected-book' element is flexible and determined by the developer.
 * 
 */

function displaySingleBook(book) {
    const selectedBookDiv = document.getElementById('selected-book');
    selectedBookDiv.innerHTML = '';

    const coverImg = book.cover_i 
        ? `${book.cover_i.replace('-S', '-L')}` // Assume higher quality image exists
        : 'https://via.placeholder.com/300';

    selectedBookDiv.innerHTML = `
        <img src="${coverImg}" alt="${book.title} Cover" class="cover-element">
        <h2 class="title-element">${book.title}</h2>
        <p class="author-element">Author: ${book.author}</p>
        <p class="rating-element">Rating: ${book.ratings_sortable}</p>
        <p class="ebook-element">eBook: ${book.ebook_access}</p>
        <p class="published-element">Published: ${book.first_publish_year}</p>
        <p class="isbn-element">ISBN: ${book.isbn}</p>
    `;

    document.getElementById('book-list').style.display = 'none';
    selectedBookDiv.style.display = 'block';
}


/**
 * Sorts the displayed book list by rating in descending order when the button is clicked.
 * 
 * 
 * @description
 * This function is triggered when the user clicks on the button with the id 'sort-rating'.
 * It sorts the currently displayed list of books based on their ratings.
 * 
 * The function performs the following actions:
 * 1. Sorts the current list of books by their ratings in descending order (highest to lowest).
 * 2. If any rating is non-numeric, such as "undefined" or "unknown", the book's rating must be changed to "0" instead.
 * 3. Updates the displayed book list with the sorted results.
 * 
 */


function handleSort() {
    const bookListItems = document.querySelectorAll('.book-item');
    const books = Array.from(bookListItems).map(item => ({
        title: item.querySelector('.title-element').textContent,
        author: item.querySelector('.author-element').textContent,
        isbn: item.dataset.isbn,
        ratings_sortable: parseFloat(item.querySelector('.rating-element').textContent.split(': ')[1]) || 0,
        ebook_access: item.querySelector('.ebook-element').textContent
    }));

    books.sort((a, b) => b.ratings_sortable - a.ratings_sortable);
    displayBookList(books);
}

/**
 * Filters the displayed book list to show only e-books when the checkbox is checked.
 * 
 * @description
 * This function ensures that when the checkbox with id 'ebook-filter' is checked, the related search results only display books that are available as e-books.
 * 
 * The function performs the following actions:
 * 1. Checks the state of the 'ebook-filter' checkbox.
 * 2. If checked:
 *    - Filters the current list of books to include only those that are borrowable as e-books.
 *    - Updates the displayed book list with the filtered results.
 * 3. If unchecked:
 *    - Displays the full list of search results without filtering.
 * 
 */

function handleFilter() {
    const ebookFilter = document.getElementById('ebook-filter');
    const books = document.querySelectorAll('.book-item');
    const isFilterActive = ebookFilter.checked;

    books.forEach(book => {
        const ebookAccess = book.querySelector('.ebook-element').textContent.toLowerCase();
        // Check for "borrowable" keyword
        book.style.display = isFilterActive && ebookAccess.includes('eBook Access: Available') ? '' : 'none';
    });
}

// Event listeners
document.getElementById('search-form').addEventListener('submit', handleSearch);
document.getElementById('sort-rating').addEventListener('click', handleSort);
document.getElementById('ebook-filter').addEventListener('change', handleFilter);