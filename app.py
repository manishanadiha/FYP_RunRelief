from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import datetime
from datetime import timedelta
from flask_marshmallow import Marshmallow
from sqlalchemy.exc import IntegrityError
from geopy.distance import geodesic
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pytz import timezone
from deap import base, creator, tools, algorithms
from apscheduler.schedulers.background import BackgroundScheduler
import random
import pytz
import logging
import os
from werkzeug.utils import secure_filename
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import desc
from flask_cors import CORS



app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

#Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/flask'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '897DB6FA36B77A3DEF1CB2D932F38097DE54DDA02D8D70B6657D51503AD92BFF'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


#Initialization
db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


class Listing(db.Model):
    __tablename__ = 'listings'
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'))
    quantity = db.Column(db.Integer)
    distribution_date = db.Column(db.DateTime)
    location_lat = db.Column(db.Float)
    location_lon = db.Column(db.Float)
    location_name = db.Column(db.String(200))
    status = db.Column(db.Enum('active', 'closed', 'completed', name='listing_status'), default='active')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    picture_url = db.Column(db.String(200), nullable=True)  
    resource_type = db.Column(db.String(200))


    organization = db.relationship('Organization', backref=db.backref('listings', lazy=True))

    def __init__(self, organization_id, quantity, distribution_date, location_lat, location_lon, location_name,resource_type, picture_url=None):
        self.organization_id = organization_id
        self.quantity = quantity
        self.distribution_date = distribution_date
        self.location_lat = location_lat
        self.location_lon = location_lon
        self.location_name = location_name
        self.picture_url = picture_url
        self.resource_type = resource_type


class Accepted(db.Model):
    __tablename__ = 'accepted'
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'), primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_name = db.Column(db.String(100))
    user_location = db.Column(db.String(200))
    user_lon = db.Column(db.Float)
    user_lat = db.Column(db.Float)
    user_address = db.Column(db.String(200))
    user_telephone = db.Column(db.String(15))

    def __init__(self, request_id, listing_id, user_id, user_name, user_location, user_lon, user_lat, user_address, user_telephone):
        self.request_id = request_id
        self.listing_id = listing_id
        self.user_id = user_id
        self.user_name = user_name
        self.user_location = user_location
        self.user_lon = user_lon
        self.user_lat = user_lat
        self.user_address = user_address
        self.user_telephone = user_telephone


class Request(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.Enum('Pending', 'Accepted', 'Rejected', name='request_status'), default='Pending')
    request_date = db.Column(db.DateTime, default=db.func.current_timestamp())

    listing = db.relationship('Listing', backref=db.backref('requests', lazy=True))
    user = db.relationship('PublicUser', backref=db.backref('requests', lazy=True))

    def __init__(self, listing_id, user_id):
        self.listing_id = listing_id
        self.user_id = user_id

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))

    discriminator = db.Column('type', db.String(20))
    __mapper_args__ = {'polymorphic_on': discriminator}

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

class Admin(User):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'admin'}

    def __init__(self, name, email, password):
        super().__init__(name=name, email=email, password=password)

class Organization(User):
    __tablename__ = 'organizations'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    address = db.Column(db.String(200))
    telephone_number = db.Column(db.String(15))
    document = db.Column(db.String(200), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    __mapper_args__ = {'polymorphic_identity': 'organization'}

    def __init__(self, name, email, password, address, telephone_number, document=None,is_verified=False):
        super().__init__(name=name, email=email, password=password)
        self.address = address
        self.telephone_number = telephone_number
        self.document = document
        self.is_verified = is_verified


class PublicUser(User):
    __tablename__ = 'public_users'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    age = db.Column(db.Integer)
    address = db.Column(db.String(200))
    location_lat = db.Column(db.Float)
    location_lon = db.Column(db.Float)
    location_name = db.Column(db.String(200))
    telephone_number = db.Column(db.String(15))
    num_dependents = db.Column(db.Integer)
    income_range = db.Column(db.String(50))
    senior_citizen = db.Column(db.Boolean)
    oku_card_holder = db.Column(db.Boolean)
    document = db.Column(db.String(200), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    __mapper_args__ = {'polymorphic_identity': 'public_user'}

    def __init__(self, name, email, password, age, address, telephone_number, 
                 num_dependents, income_range, senior_citizen, oku_card_holder, 
                 location_lat, location_lon, location_name, document=None, is_verified=False):
        super().__init__(name=name, email=email, password=password)
        self.age = age
        self.address = address
        self.telephone_number = telephone_number
        self.num_dependents = num_dependents
        self.income_range = income_range
        self.senior_citizen = senior_citizen
        self.oku_card_holder = oku_card_holder
        self.location_lat = location_lat
        self.location_lon = location_lon
        self.location_name = location_name
        self.document = document
        self.is_verified = is_verified



class Articles(db.Model):
    __tablename__ = 'articles'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    body = db.Column(db.Text())
    date = db.Column(db.DateTime, default=datetime.datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    picture_url = db.Column(db.String(200), nullable=True)  


    user = db.relationship('User', backref=db.backref('articles', lazy=True))

    def __init__(self, title, body, user_id, picture_url=None):
        self.title = title
        self.body = body        
        self.user_id = user_id
        self.picture_url = picture_url

class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    user = db.relationship('User', backref=db.backref('documents', lazy=True))

    def __init__(self, filename, user_id):
        self.filename = filename
        self.user_id = user_id


class ArticleSchema(ma.Schema):
    class Meta:
        fields = ('id', 'title', 'body', 'date')

article_schema = ArticleSchema()
articles_schema = ArticleSchema(many=True)


#Profile Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    address = data.get('address')
    telephone_number = data.get('telephone_number')
    user_type = data.get('type')


    try:
        if user_type == 'organization':
            new_user = Organization(name=name, email=email, password=password, address=address, telephone_number=telephone_number)
        elif user_type == 'public_user':
            age = data.get('age')
            location_lat = data.get('location_lat')
            location_lon = data.get('location_lon')
            location_name = data.get('location_name')
            num_dependents = data.get('num_dependents')
            income_range = data.get('income_range')
            senior_citizen = data.get('senior_citizen')
            oku_card_holder = data.get('oku_card_holder')
            
            
            new_user = PublicUser(name=name, email=email, password=password, age=age, 
                                  address=address, telephone_number=telephone_number, 
                                  num_dependents=num_dependents, income_range=income_range, 
                                  senior_citizen=senior_citizen, oku_card_holder=oku_card_holder, 
                                  location_lat=location_lat, location_lon=location_lon, 
                                  location_name=location_name)
        elif user_type == 'admin':
            new_user = Admin(name=name, email=email, password=password)
        else:
            return jsonify({'error': 'Invalid user type'}), 400

        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'User with this email already exists'}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity={'user_id': user.id, 'user_type': user.discriminator})
        return jsonify({'access_token': access_token, 'user_id': user.id, 'user_type': user.discriminator ,
                        'message': 'User logged in successfully'}), 200

    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/profile/<user_type>/<user_id>', methods=['GET'])
def get_profile(user_type, user_id):
    if user_type == 'admin':
        user = Admin.query.get(user_id)
    elif user_type == 'organization':
        user = Organization.query.get(user_id)
    elif user_type == 'public_user':
        user = PublicUser.query.get(user_id)
    else:
        return jsonify({'error': 'Invalid user type'}), 400
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = {
        'id' : user.id,
        'name' : user.name,
        'email' : user.email
    }
    
    if user_type == 'organization':
        user_data.update({
            'address': user.address,
            'telephone_number': user.telephone_number,
            'is_verified' : user.is_verified,
        })
    elif user_type == 'public_user':
        user_data.update({
            'age': user.age,
            'location_name': user.location_name,
            'address': user.address,
            'telephone_number': user.telephone_number,
            'num_dependents': user.num_dependents,
            'income_range': user.income_range,
            'senior_citizen': user.senior_citizen,
            'oku_card_holder': user.oku_card_holder,
            'is_verified' : user.is_verified,
        })

    return jsonify(user_data), 200

@app.route('/profile/<user_type>/<user_id>/', methods=['PUT'])
def update_profile(user_type, user_id):
    data = request.json

    if user_type == 'admin':
        user = Admin.query.get(user_id)
    elif user_type == 'organization':
        user = Organization.query.get(user_id)
    elif user_type == 'public_user':
        user = PublicUser.query.get(user_id)
    else:
        return jsonify({'error': 'Invalid user type'}), 400

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    # Update other fields based on user type
    if user_type == 'organization':
        user.address = data.get('address', user.address)
        user.telephone_number = data.get('telephone_number', user.telephone_number)
    elif user_type == 'public_user':
        user.age = data.get('age', user.age)
        user.location_lat = data.get('location_lat', user.location_lat)
        user.location_lon = data.get('location_lon', user.location_lon)
        user.location_name = data.get('location_name', user.location_name)
        user.address = data.get('address', user.address)
        user.telephone_number = data.get('telephone_number', user.telephone_number)
        user.num_dependents = data.get('num_dependents', user.num_dependents)
        user.income_range = data.get('income_range', user.income_range)
        user.senior_citizen = data.get('senior_citizen', user.senior_citizen)
        user.oku_card_holder = data.get('oku_card_holder', user.oku_card_holder)

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

@app.route('/document/<user_type>/<user_id>', methods=['POST'])
def upload_documents(user_type, user_id):

    if 'file' not in request.files:
     return jsonify ({'error': 'No documents'}), 400
    
    file = request.files['file']

    if file.filename == '':
     return jsonify({'error': 'No documents uploaded'}), 400
    
    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    # Determine the user type and query the appropriate model
    if user_type == 'organization':
        user_model = Organization
    elif user_type == 'public_user':
        user_model = PublicUser
    else:
        return jsonify({'error': 'Invalid user type'}), 400
    
    # Retrieve the user instance
    user = user_model.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Update the document column in the user model
    user.document = filename
    db.session.commit()

    return jsonify({'message': 'Document uploaded successfully'}), 200

@app.route('/verify/public/<user_id>', methods=['PUT'])
def verify_public_user(user_id):
    try:
        # Retrieve the user instance
        user = PublicUser.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update the is_verified field
        user.is_verified = True
        db.session.commit()
        
        return jsonify({'message': 'User has been verified successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/verify/org/<user_id>', methods=['PUT'])
def verify_organization(user_id):
    try:
        # Retrieve the user instance
        user = Organization.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update the is_verified field
        user.is_verified = True
        db.session.commit()
        
        return jsonify({'message': 'User has been verified successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/unverified/org', methods=['GET'])
def unverified_organization():
    try:
        # Query the database for all unverified public users
        unverified_users = Organization.query.filter_by(is_verified=False).all()


        # Convert the results to a list of dictionaries
        unverified_users_list = [
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'address': user.address,
                'telephone_number': user.telephone_number,
                'document': user.document,
                'is_verified':user.is_verified
            }
            for user in unverified_users
        ]

        # Return the results as a JSON response
        return jsonify(unverified_users_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/unverified/public', methods=['GET'])
def unverified_public():
    try:
        # Query the database for all unverified public users
        unverified_users = PublicUser.query.filter_by(is_verified=False).all()

        # Convert the results to a list of dictionaries
        unverified_users_list = [
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'age': user.age,
                'telephone_number': user.telephone_number,
                'num_dependents': user.num_dependents,
                'income_range': user.income_range,
                'senior_citizen': user.senior_citizen,
                'oku_card_holder': user.oku_card_holder,
                'document': user.document,
                'is_verified':user.is_verified

            }
            for user in unverified_users
        ]

        # Return the results as a JSON response
        return jsonify(unverified_users_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



    








###### Resources 

### Resources Functions
# Malaysia pytz
malaysia = timezone('Asia/Singapore')

# Retrieve all listings
def get_all_listings():
    listings = Listing.query.order_by(Listing.distribution_date).all()
    return listings



# def get_listings_by_status(status_list):
#     if isinstance(status_list, str):
#         status_list = [status_list]
#     query = Listing.query.filter(Listing.status.in_(status_list))
#     return [listing.to_dict() for listing in query.all()]

# Retrieve listings by status
def get_listings_by_status(status):
    listings = Listing.query.filter_by(status=status).order_by(Listing.distribution_date).all()
    return listings

# Retrieve active listings
def get_active_listings():
    listings = Listing.query.filter_by(status='active').order_by(Listing.distribution_date).all()
    return listings

# Retrieve listings filtered by organization ID
def get_listings_by_organization(organization_id):
    return Listing.query.filter_by(organization_id=organization_id).order_by(Listing.distribution_date).all()

# Retrieve listings filtered by organization ID & status
def get_listings_by_organization_and_status(organization_id, status):
    listings = Listing.query.filter_by(organization_id=organization_id, status=status).order_by(Listing.distribution_date).all()
    return listings

# Calculate distance for nearby listings
def calculate_distance(location1, location2):
    # Calculate distance between two locations
    return geodesic(location1, location2).kilometers

# Retrieve specific listing by id
def get_listing_by_id(id):
    listing = Listing.query.get(id)
    return listing

### Resources Routes
@app.route('/listings', methods=['POST'])
def create_listing():
    organization_id = request.form['organization_id']
    quantity = request.form['quantity']


    # Parse ISO format datetime string manually
    distribution_date = datetime.datetime.strptime(request.form['distribution_date'], '%Y-%m-%dT%H:%M:%S.%fZ')

    distribution_date_malaysia = distribution_date.replace(tzinfo=pytz.utc).astimezone(malaysia)

    location_lat = request.form['location_lat']
    location_lon = request.form['location_lon']
    location_name = request.form['location_name']
    resource_type = request.form['resource_type']

    picture_url = None

    if 'picture' in request.files:
        file = request.files['picture']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            picture_url = filename  # Store only the filename in the database


    listing = Listing(
        organization_id=organization_id,
        quantity=quantity,
        distribution_date=distribution_date_malaysia,
        location_lat=location_lat,
        location_lon=location_lon,
        location_name=location_name,
        resource_type=resource_type,
        picture_url=picture_url
    )
    db.session.add(listing)
    db.session.commit()

    # Schedule genetic algorithm for the new listing
    execution_time = distribution_date - timedelta(hours=24)
    scheduler.add_job(genetic_algorithm_and_store, 'date', run_date=execution_time, args=[listing.id])
    logging.info(f"Scheduled job for new listing {listing.id} at {execution_time}")

    return jsonify({'message': 'Listing created successfully'}), 201


@app.route('/listings', methods=['GET'])
def get_listings():
    status = request.args.get('status')
    if status:
        listings = get_listings_by_status(status)
    else:
        listings = get_all_listings()


        
    response = []
    for listing in listings:
        org_name = listing.organization.name
        location_name = listing.location_name
        quantity = listing.quantity
        status = listing.status
        date_time = listing.distribution_date
        resource_type = listing.resource_type
        picture_url = None
        if listing.picture_url:
            picture_url = request.host_url + 'uploads/' + listing.picture_url

        response.append({
            'id': listing.id,
            'organization_name': org_name,
            'quantity': quantity,
            'date_time': date_time,
            'location_name': location_name,
            'resource_type': resource_type,
            'status': status,
            'picture_url': picture_url

        })
    return jsonify(response)

#Listings created by organization
@app.route('/listings/org/<organization_id>')
def get_org_listings(organization_id):
    status = request.args.get('status')

    if status:
        listings = get_listings_by_organization_and_status(organization_id, status)
    else:
        listings = get_listings_by_organization(organization_id)

    if not listings:
        return jsonify({'message': 'No listings found for the organization'}), 404
    
    response = []
    for listing in listings:
        org_id = listing.organization.id
        org_name = listing.organization.name
        location_name = listing.location_name
        quantity = listing.quantity
        date_time = listing.distribution_date
        resource_type = listing.resource_type
        picture_url = None
        if listing.picture_url:
            picture_url = request.host_url + 'uploads/' + listing.picture_url


        response.append({
            'id': listing.id,
            'organization_id': org_id,
            'organization_name': org_name,
            'quantity': quantity,
            'date_time': date_time,
            'location_name': location_name,
            'resource_type': resource_type,
            'picture_url': picture_url
           
        })
    return jsonify(response)


#Nearby listings for public user
@app.route('/listings/nearby/<user_id>', methods=['GET'])
def get_nearby_listings(user_id):

    # Retrieve the user's location (latitude and longitude) from the database
    user = PublicUser.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_location = (user.location_lat, user.location_lon)

    listings = get_active_listings()

    nearby_listings = []
    for listing in listings:
        listing_location = (listing.location_lat, listing.location_lon)
        distance_km = calculate_distance(user_location, listing_location)
        if distance_km <= 5:  # Filter only listings within 5km

            # Calculate the countdown in milliseconds to 24 hours before distribution_date
            distribution_date = listing.distribution_date
            countdown_target = distribution_date - timedelta(hours=24)
            current_time = datetime.datetime.now()
            countdown_ms = max(int((countdown_target - current_time).total_seconds() * 1000), 0)
            resource_type = listing.resource_type
            picture_url = None
            if listing.picture_url:
                picture_url = request.host_url + 'uploads/' + listing.picture_url

            nearby_listings.append({
                'id': listing.id,
                'organization_name': listing.organization.name,
                'quantity': listing.quantity,
                'date_time': distribution_date,
                'location_name': listing.location_name,
                'countdown': countdown_ms,
                'resource_type': resource_type,
                'picture_url': picture_url
                
            })
    
    return jsonify(nearby_listings)


# View specific listings
@app.route('/listings/<id>', methods=['GET'])
def open_listing(id):
    listing = get_listing_by_id(id)
    if not listing:
        return jsonify({'error': 'Listing not found'}), 404
    
    picture_url = None
    if listing.picture_url:
        picture_url = request.host_url + 'uploads/' + listing.picture_url

    response = {
        'organization_name': listing.organization.name,
        'organization_id': listing.organization.id,
        'quantity': listing.quantity,
        'date_time': listing.distribution_date,
        'location_name': listing.location_name,
        'resource_type': listing.resource_type,
        'status': listing.status,
        'picture_url': picture_url
    }

    return jsonify(response)


@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_data = {
        'id': user.id,
        'is_verified': user.is_verified
    }

    return jsonify(user_data)


#Make request for listing
@app.route('/request/<id>', methods=['POST'])
def request_listing(id):
    data = request.json
    user_id = data.get('user_id')


    if not user_id:
        return jsonify({'error': 'User ID not provided'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Check if the user is verified
    if not user.is_verified:
        return jsonify({'error': 'User is not verified'}), 403

    # Check if the listing exists
    listing = Listing.query.get(id)
    if not listing:
        return jsonify({'message': 'Listing not found'}), 404

    # Check if the user has already requested this listing
    existing_request = Request.query.filter_by(listing_id=id, user_id=user_id).first()
    if existing_request:
        return jsonify({'message': 'You have already requested this listing'}), 400

    # Create a new request
    request_entry = Request(
        listing_id=id,
        user_id=user_id
    )
    db.session.add(request_entry)
    db.session.commit()
    return jsonify({'message': 'Request submitted successfully'}), 201


# View requested listing
@app.route('/listings/requested/<user_id>', methods=['GET'])
def get_requested_listings(user_id):
    status = request.args.get('status')

    print(f"Fetching listings for user {user_id} with status filter: {status}")

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Retrieve requests made by the user, optionally filtered by status
    if status:
        user_requests = Request.query.filter_by(user_id=user_id, status=status).all()
    else:
        user_requests = Request.query.filter_by(user_id=user_id).all()

    listings = []
    for req in user_requests:
        listing = Listing.query.get(req.listing_id)
        if listing:
            org_name = listing.organization.name
            location_name = listing.location_name
            quantity = listing.quantity
            status = listing.status
            date_time = listing.distribution_date
            picture_url = None
            if listing.picture_url:
                picture_url = request.host_url + 'uploads/' + listing.picture_url

            listings.append({
                'id': listing.id,
                'organization_name': org_name,
                'quantity': quantity,
                'date_time': date_time,
                'location_name': location_name,
                'status': status,
                'picture_url': picture_url
            })

    return jsonify({'listings': listings}), 200


@app.route('/request/status/<listing_id>/<user_id>',methods=['GET'])
def get_request_status(listing_id, user_id):

    # Check if the request exists
    request_status = Request.query.filter_by(listing_id=listing_id, user_id=user_id).first()
    if request_status:
        return jsonify({
            'status': request_status.status,
        }), 200
    else:
        return jsonify({'message': 'Request not found'}), 404



###Genetic Algorithm 

scheduler = BackgroundScheduler()

# Define a custom class for individuals with a fitness attribute
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

# Toolbox setup
toolbox = base.Toolbox()

def get_requests_for_listing(listing_id):
    requests = Request.query.filter_by(listing_id=listing_id, status='pending').all()
    return requests

def get_user_data(user_id):
    return User.query.get(user_id)

def get_listing_quantity(listing_id):
    listing = Listing.query.get(listing_id)
    return listing.quantity if listing else 0

# Fitness Function
def calculate_fitness(user):
    print("calculate_fitness called for user:", user.id)
    fitness = 0

    if user.income_range == 'Below 2500':
        fitness += 10
    elif user.income_range == 'RM2500 - RM3500':
        fitness += 9
    elif user.income_range == 'RM3500 - RM4500':
        fitness += 8
    elif user.income_range == 'RM4500 - RM5500':
        fitness += 7
    elif user.income_range == 'RM5500 - RM6500':
        fitness += 6
    elif user.income_range == 'RM6500 - RM7500':
        fitness += 5
    elif user.income_range == 'RM7500 - RM8500':
        fitness += 4
    elif user.income_range == 'RM8500 - RM9500':
        fitness += 3
    elif user.income_range == 'RM9500 - RM10500':
        fitness += 2
    elif user.income_range == 'Above RM10500':
        fitness += 1

    fitness += user.num_dependents

    if user.senior_citizen:
        fitness += 2
    
    if user.oku_card_holder:
        fitness += 2

    # Calculate the time since the last accepted request
    last_accepted_request = Request.query.filter_by(user_id=user.id, status='Accepted').order_by(Request.request_date.desc()).first()
    
    if last_accepted_request:
        time_since_last_accepted = datetime.datetime.now() - last_accepted_request.request_date
        # Reduce the fitness score by 2 point if the last accepted request was within the last 30 days
        if time_since_last_accepted <= timedelta(days=30):
            fitness -= 2

    return fitness

# Genetic Algorithm Implementation
import random
from deap import base, creator, tools, algorithms

def genetic_algorithm(listing_id, population_size=100, max_generations=250):
    quantity = get_listing_quantity(listing_id)
    if quantity == 0:
        return []

    requests = get_requests_for_listing(listing_id)
    if not requests:
        return []
    
    population = [request.user_id for request in requests]

    if len(population) <= quantity:
        return population

    user_data = {user_id: get_user_data(user_id) for user_id in population}
    
    def eval_individual(individual):
        return (sum(calculate_fitness(user_data[user_id]) for user_id in individual),)

    def unique_individual():
        return creator.Individual(random.sample(population, quantity))

    def custom_crossover(parent1, parent2):
        crossover_point = random.randint(1, quantity - 1)
        child1 = parent1[:crossover_point] + [x for x in parent2 if x not in parent1[:crossover_point]]
        child2 = parent2[:crossover_point] + [x for x in parent1 if x not in parent2[:crossover_point]]
        return creator.Individual(child1[:quantity]), creator.Individual(child2[:quantity])

    def custom_mutate(individual, indpb=0.05):
        for i in range(len(individual)):
            if random.random() < indpb:
                swap_index = random.randint(0, len(individual) - 1)
                individual[i], individual[swap_index] = individual[swap_index], individual[i]
        return individual,

    toolbox.register("individual", unique_individual)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    
    toolbox.register("mate", custom_crossover)
    toolbox.register("mutate", custom_mutate, indpb=0.05)
    toolbox.register("select", tools.selTournament, tournsize=3)
    toolbox.register("evaluate", eval_individual)

    pop = toolbox.population(n=population_size)

    algorithms.eaSimple(pop, toolbox, cxpb=0.5, mutpb=0.2, ngen=max_generations, verbose=False)

    top_individual = tools.selBest(pop, 1)[0]
    return list(top_individual)

def genetic_algorithm_and_store(listing_id, population_size=200, max_generations=500):
    with app.app_context():

        # Update the listing status to 'closed'
        listing = Listing.query.get(listing_id)
        if listing:
            listing.status = 'closed'
            db.session.commit()
  
        # Run the genetic algorithm
        accepted_user_ids = genetic_algorithm(listing_id, population_size, max_generations)


        requests = Request.query.filter_by(listing_id=listing_id).all()


        # Store the accepted users in the Accepted table
        for user_id in accepted_user_ids:
            user = PublicUser.query.get(user_id)
            request_id = Request.query.filter_by(listing_id=listing_id, user_id=user_id).first().id
            accepted_entry = Accepted(
                request_id=request_id, 
                listing_id=listing_id, 
                user_id=user.id,
                user_name=user.name,
                user_location=user.location_name,
                user_lon=user.location_lon,
                user_lat=user.location_lat,
                user_address=user.address,
                user_telephone=user.telephone_number
            )
            db.session.add(accepted_entry)


        for request in requests:
            if request.user_id in accepted_user_ids:
                # Update request status to accepted
                request.status = 'Accepted'
            else:
                # Update request status to rejected
                request.status = 'Rejected'


        # Update the listing status to completed
        listing = Listing.query.get(listing_id)
        if listing:
            listing.status = 'completed'


        db.session.commit()


    return accepted_user_ids




# Function to schedule the genetic algorithm for each listing
def schedule_genetic_algorithm():
    with app.app_context():
        listings = get_all_listings()
        for listing in listings:
            execution_time = listing.distribution_date - timedelta(hours=24)
            scheduler.add_job(genetic_algorithm_and_store, 'date', run_date=execution_time, args=[listing.id])
            logging.info(f"Scheduled job for listing {listing.id} at {execution_time}")

# Schedule the genetic algorithm for each listing when the application starts
# Background scheduler initialization
#with app.app_context():
    #schedule_genetic_algorithm()
    #scheduler.start()

@app.route('/listings/<id>/accepted', methods=['GET'])
def get_accepted_listing_users(id):
    # Ensure the genetic algorithm runs and stores results if not already stored
    # accepted_user_ids = genetic_algorithm_and_store(listing_id=id)

    # Retrieve the stored accepted user details from the database
    accepted_users = Accepted.query.filter_by(listing_id=id).all()
    accepted_user_details = [{
        'id': user.user_id,
        'name': user.user_name,
        'location': user.user_location,
        'address': user.user_address,
        'telephone': user.user_telephone
    } for user in accepted_users]

    return jsonify({'accepted_users': accepted_user_details})

# Function to get user details
def get_user_details(user_ids):
    users = PublicUser.query.filter(PublicUser.id.in_(user_ids)).all()
    user_details = []
    for user in users:
        user_details.append({
            'id': user.id,
            'name': user.name,
            'location_name': user.location_name,
            'address': user.address,
            'telephone_number': user.telephone_number
        })
    return user_details



##### Post Routes

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/articles', methods=['GET'])
def get_articles():
    all_articles = Articles.query.order_by(desc(Articles.date)).all()
    response = []
    for article in all_articles:
        picture_url = None
        if article.picture_url:
            picture_url = request.host_url + 'uploads/' + article.picture_url
        
        response.append({
            'id': article.id,
            'title': article.title,
            'body': article.body,
            'date': article.date,
            'user_id': article.user_id,
            'user_name': article.user.name, 
            'picture_url': picture_url
        })
    return jsonify(response)

# Retrieve articles filtered by user
def get_articles_by_user(user_id):
    return Articles.query.filter_by(user_id=user_id).order_by(desc(Articles.date)).all()

@app.route('/articles/user/<user_id>', methods=['GET'])
def get_user_articles(user_id):
    articles = get_articles_by_user(user_id)

    if not articles:
        return jsonify({'message': 'No posts found for the user'}), 404

    response = []
    for article in articles:
        picture_url = None
        if article.picture_url:
            picture_url = request.host_url + 'uploads/' + article.picture_url
        

        response.append({
            'id': article.id,
            'title': article.title,
            'body': article.body,
            'date': article.date,
            'user_id': article.user_id,
            'picture_url': picture_url
        })
    return jsonify(response)



@app.route('/articles/<id>/', methods=['GET'])
def post_details(id):
    article = Articles.query.get(id)

    if not article:
        return jsonify({'message': 'Post not found'}), 404

    # Construct picture URL
    picture_url = None
    if article.picture_url:
        picture_url = request.host_url + 'uploads/' + article.picture_url

    # Construct response data
    response = {
        'id': article.id,
        'title': article.title,
        'body': article.body,
        'date': article.date.strftime("%Y-%m-%d %H:%M:%S"),
        'user_id': article.user_id,
        'user_name': article.user.name,
        'picture_url': picture_url
    }

    return jsonify(response)

@app.route('/createarticles', methods=['POST'])
def create_article():
    if 'title' not in request.form or 'body' not in request.form or 'user_id' not in request.form:
        return jsonify({'message': 'Missing data'}), 400

    title = request.form['title']
    body = request.form['body']
    user_id = request.form['user_id']
    picture_url = None

    if 'picture' in request.files:
        file = request.files['picture']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            picture_url = filename  # Store only the filename in the database

    article = Articles(
        title=title,
        body=body,
        user_id=user_id,
        picture_url=picture_url
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({'message': 'Post created successfully'}), 201


@app.route('/updatearticles/<id>/', methods=['PUT'])
def update_article(id):
    article = Articles.query.get(id)
    
    if not article:
        return jsonify({'message': 'Article not found'}), 404

    title = request.form.get('title')
    body = request.form.get('body')
    user_id = request.form.get('user_id')
    picture_url = article.picture_url

    if 'picture' in request.files:
        file = request.files['picture']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            picture_url = filename

    if title:
        article.title = title
    if body:
        article.body = body
    if user_id:
        article.user_id = user_id
    if picture_url:
        article.picture_url = picture_url

    db.session.commit()
    return jsonify({'message': 'Post updated successfully'}), 200

@app.route('/deletearticles/<id>/', methods=['DELETE'])
def article_delete(id):
    if not id:
        return jsonify({'error': 'Missing post ID'}), 400
    
    article = Articles.query.get(id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    try:
        # Implement a confirmation check here if needed
        confirmation = request.args.get('confirm')
        if confirmation and confirmation.lower() == 'yes':
            db.session.delete(article)
            db.session.commit()
            return jsonify({'message': 'Post deleted'}), 200
        else:
            return jsonify({'message': 'Deletion cancelled'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    with app.app_context():
        schedule_genetic_algorithm()
        scheduler.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
