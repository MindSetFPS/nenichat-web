# the-good-one

## Doing

- [ ] In orders page, filter by today, week, month, year, all time

## TODO

- [ ] Fix most recents messages (chats)
- [ ] Set when a message is a sale
- [ ] Send messages
- [ ] Limited time products
- [ ] Sync chat
- [ ] A contact can have unlimited lids, returns all the messages that belong to a lid
    - Preview merge: 

    In a chat, i have a button that allows me to merge the contact with another contact. It shows a list of contacts that can be merged with the current contact. When i select a contact, it shows a preview of the merge.

    To make this happen, i need to:
    - 1. Query other contacts. First 25 contacts that have sent recent messages, they probably should only be contacts without a phone number.
    - 2. Query messages from the contact to merge.
    - 3. Render the messages in the chat.
    - 4. Show a buton to cancel and to proceed.
    - 5. I can easily switch to the next contact, which puls recent messages and replaces previous messages.
    - 6. When i click proceed, it queries '/api/contacts/merge' with the primary contact id and the secondary contact ids.

- [x] From message counting graph in home, do not count messags from groups
- [x] Fix landing page
- [x] Add a day separator to the chat


# Bugs:

- [ ] Do not save empty messages (stickers, voice notes, images, reactions)
- Audience:
    - [ ] Delete audience does not work
- [x] Width is fixed and looks weird in medium sized screens
- [ ] Product stock does not decrease when selling

# KPI:

- Messages per sale: I need to know how many messages it takes to make a sale. Each message increases the cost of the sale.
- I need to find a good number of messages to aim.

# Features:

- TTS Read messages
- Hide contacts
- Groups support
- Actually automate sending messages
- Set order to a message
- Delete products
- See products statistics
- See sales statistics
- See sales per product
- Send messages from the app
- Customer can pay in advance: 


# What do customers actually do when messaging?

for now we only want to know about this cases:

- greeting
- asking if its open
- buying
