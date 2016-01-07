/**
 * Created by cocos on 15/12/29.
 */
var Enemy = cc.PhysicsSprite.extend({
    enemyType : 0,
    initalHitPoints : 0,
    hitPoints : 0,
    velocity : null,
    space : null,

    ctor:function(enemyType,space){
        var enemyFrameName = EnemyName.Enemy_Stone;

        var hitPointTemp = 0;

        var velocityTemp = cc.p(0,0);

        switch(enemyType){
            case EnemyTypes.Enemy_Stone:
                enemyFrameName = EnemyName.Enemy_Stone;
                hitPointTemp = Enemy_initialHitPoints.Enemy_Sotne;
                velocityTemp = Sprite_Velocity.Enemy_Stone;
                break;

            case EnemyTypes.Enemy_1:
                enemyFrameName = EnemyName.Enemy_1;
                hitPointTemp = Enemy_initialHitPoints.Enemy_1;
                velocityTemp = Sprite_Velocity.Enemy_1;
                break;

            case EnemyTypes.Enemy_2:
                enemyFrameName = EnemyName.Enemy_2;
                hitPointTemp = Enemy_initialHitPoints.Enemy_2;
                velocityTemp = Sprite_Velocity.Enemy_2;
                break;

            case EnemyTypes.Enemy_Planet:
                enemyFrameName = EnemyName.Enemy_Planet;
                hitPointTemp = Enemy_initialHitPoints.Enemy_Planet;
                velocityTemp = Sprite_Velocity.Enemy_Planet;
                break;

        }

        this._super("#" + enemyFrameName);
        this.setVisible(false);

        this.initalHitPoints = hitPointTemp;
        this.velocity = velocityTemp;
        this.enemyType = enemyType;

        this.space = space;

        var shape;

        if(enemyType == EnemyTypes.Enemy_Stone || enemyType == EnemyTypes.Enemy_Planet){
            this.body = new cp.Body(10, cp.momentForCircle( 1, 0, this.getContentSize().width / 2 - 5, cp.v(0,0)));
            shape = new cp.CircleShape(this.body,this.getContentSize().width / 2 - 5, cp.v(0,0));
        }else if(enemyType == EnemyTypes.Enemy_1){
            var verts = [
                -5, -91.5,
                -59, -54.5,
                -106, -0.5,
                -68, 86.5,
                56, 88.5,
                110, -4.5
            ];
            this.body = new cp.Body(1, cp.momentForPoly(1, verts, cp.vzero));
            shape = new cp.PolyShape( this.body, verts, cp.vzero);
        }else if(enemyType == EnemyTypes.Enemy_2){
            var verts = [
                2.5, 64.5,
                73.5, -9.5,
                5.5, -63.5,
                -71.5, -6.5
            ];
            this.body = new cp.Body(1, cp.momentForPoly(1, verts, cp.vzero));
            shape = new cp.PolyShape(this.body, verts, cp.vzero);
        };

        this.space.addBody(this.body);

        shape.setElasticity(0.5);
        shape.setFriction(0.5);
        shape.setCollisionType(Collision_Type.Enemy);
        this.space.addShape(shape);
        this.body.data = this;

        this.scheduleUpdate();
    },

    update:function(dt){
        switch(this.enemyType){
            case EnemyTypes.Enemy_Stone:
                this.setRotation(this.getRotation() - 0.5);
                break;

            case EnemyTypes.Enemy_Planet:
                this.setRotation(this.getRotation() + 1);
                break;
        };

        var newX = this.body.getPos().x + this.velocity.x * dt;
        var newY = this.body.getPos().y + this.velocity.y * dt;

        this.body.setPos(cc.p( newX, newY));

        if(this.body.getPos().y + this.getContentSize().height / 2 < 0){
            this.spawn();
        };
    },

    spawn:function(){
        var yPos = winSize.height + this.getContentSize().height / 2;
        var xPos = cc.random0To1() * (winSize.width - this.getContentSize().width / 2) + this.getContentSize().width / 2;

        this.body.setPos(cc.p(xPos, yPos));

        this.hitPoints = this.initalHitPoints;
        this.setVisible(true);
    },
});